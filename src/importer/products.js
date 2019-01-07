const productTemplate = require('../templates/product')
const sendToElastic = require('../common/sendToElastic')
const removeFromElastic = require('../common/removeFromElastic')
const Throttle = require('promise-parallel-throttle')

const deleteUnused = async (elasticClient, indexName, timestamp) => {
  // remove deleted products
  const response = await elasticClient.search({
    index: indexName,
    type: 'product',
    body: {
      query: {
        range: {
          timestamp: {
            lt: timestamp
          }
        }
      }
    }
  })

  for (const product of response.hits.hits) {
    await removeFromElastic(product, 'product', { config, elasticClient })
  }
}

const importer = ({ config, elasticClient, apiConnector, logger, page = 1, perPage = 20}) => {
  console.time('importer');
  const requestQueue = []

  requestQueue.push(() => apiConnector(config).getAsync(`products?page=${page}&per_page=${perPage}`))

  let productsImportedCount = 0;
  let timestamp = new Date().getTime()

  Throttle.all(requestQueue).then(async requestedProductsChunks => {
    for (let chunk of requestedProductsChunks) {
      logger.info(`processing page no. ${page}`)
      let body = chunk.toJSON().body
      let products = JSON.parse(body)
      if (!Array.isArray(products) || products.length===0) {
        console.log(products)
        logger.info(`There are no products on page ${page}`)
        return;
      }
      const convertingQueue = products.map(product => () => {
        product.timestamp = timestamp
        logger.info(`processing product id ${product.id}`)
        return productTemplate.fill(product, { apiConnector, elasticClient, config, logger })
      })

      Throttle.all(convertingQueue).then(convertedProducts => {
          const sendingQueue = convertedProducts.map(product => () => sendToElastic(product, 'product', {config, elasticClient, logger}))
          Throttle.all(sendingQueue).then(result => {
            productsImportedCount += result.filter(success => success).length
            logger.info(`${result.filter(success => success).length} products were successfully imported.`)
          })
        }
      )
    }
    console.timeEnd('importer');
  })

  function importProducts() {
    logger.info('products are being imported...')
  }

  return {
    importProducts
  }
}

module.exports = Object.freeze({
  importer
})