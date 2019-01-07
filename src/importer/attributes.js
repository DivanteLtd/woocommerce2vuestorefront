const config = require('../../config')
const WooCommerceAPI = require('woocommerce-api');
const attributeTemplate = require('../templates/attribute')
const sendToElastic = require('../common/sendToElastic')
const Throttle = require('promise-parallel-throttle')

const connector = () => {
  let { host, protocol } = config.woo.api;

  return new WooCommerceAPI({
    url: `${protocol}://${host}`,
    consumerKey: config.woo.api.auth.consumer_key,
    consumerSecret: config.woo.api.auth.consumer_secret,
    wpAPI: true,
    version: 'wc/v1'
  })
}

const importer = ({ config, elasticClient, apiConnector, logger }) => {

  connector().getAsync('products/attributes?per_page=100').then(
    (result) => {
      let body = result.toJSON().body
      let attributes = JSON.parse(body)
      const convertingQueue = attributes.map(attribute => () => attributeTemplate.fill(attribute))

      Throttle.all(convertingQueue).then(convertedAttributes => {
          const sendingQueue = convertedAttributes.map(attribute => () => sendToElastic(attribute, 'attribute', {config, elasticClient, logger}))

          Throttle.all(sendingQueue).then(result => {
            logger.info(result)
            logger.info(`${result.filter(success => success).length} attributes were successfully imported`)
          })
        }
      )
    }).catch(error => logger.info(error))

  function importAttributes() {
    logger.info('attributes are being imported...')
  }

  return {
    importAttributes
  }
}

module.exports = Object.freeze({
  importer
})