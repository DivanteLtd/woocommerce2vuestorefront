const appRoot = require('app-root-path');

module.exports = Object.freeze({
  woo: {
    api: {
      host: 'localhost',
      protocol: 'http',
      auth: {
        consumer_key: "ck_36748f3bac677abc6f7ee2a03a68b8eb4c1c5e7f",
        consumer_secret: "cs_9f15969c5c2f6c4bcc54104c88bdb31f71dca871",
        version: "v3"
      }
    }
  },
  db: {
    host: 'localhost',
    port: 9200,
    driver: 'elasticsearch',
    url: process.env.DATABASE_URL || 'http://localhost:9200',
    indexName:  process.env.INDEX_NAME || 'vue_storefront_catalog'
  },
  winston: {
    file: {
      level: 'info',
      filename: `${appRoot}/logs/app.log`,
      handleExceptions: true,
      json: true,
      maxsize: 5242880,
      maxFiles: 5,
      colorize: false,
    },
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    }
  }
})