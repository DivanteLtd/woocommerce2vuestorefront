'use strict'

const config = require('./config')
const program = require('commander')
const logger = require('./src/common/logger')
const productImporter = require('./src/importer/products')
const categoryImporter = require('./src/importer/categories')
const attributeImporter = require('./src/importer/attributes')
const WooCommerceAPI = require('woocommerce-api');
const elasticsearch = require('elasticsearch')

const client = new elasticsearch.Client({
  host: `${config.db.host}:${config.db.port}`,
  log: 'warning'
})


const connector = () => {
  let {protocol, host} = config.woo.api
  return WooCommerceAPI({
    url: `${protocol}://${host}`,
    consumerKey: config.woo.api.auth.consumer_key,
    consumerSecret: config.woo.api.auth.consumer_secret,
    wpAPI: true,
    version: 'wc/v1'
  })
}

program.command('attributes').option('-p, --page', 'current page').option('-P, --pages', 'pages')
  .action(cmd => { attributeImporter.importer({ config: config, elasticClient: client, apiConnector: connector, logger }).importAttributes() })

program.command('products')
  .option('--perPage <n>', 'per page', parseInt)
  .option('--page <n>', 'current page', parseInt)
  .action((cmd) => { productImporter.importer({ config: config, elasticClient: client, apiConnector: connector, logger: logger, page: cmd.page, perPage: cmd.perPage}).importProducts() })

program.command('categories')
  .action(cmd => { categoryImporter.importer({ config: config, elasticClient: client, apiConnector: connector, logger }).importCategories() })

program
  .on('command:*', () => {
    logger.warn('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
  });

program
  .parse(process.argv)