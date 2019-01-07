
# Introduction

*woocommerce2vuestorefront* indexer is standalone application designed to feed VSF's read models with data right from WooCommerce.

 ## Video demo
 [![See how it works!](https://github.com/DivanteLtd/vue-storefront/raw/master/docs/.vuepress/public/Fil-Rakowski-VS-Demo-Youtube.png)](https://www.youtube.com/watch?v=L4K-mq9JoaQ)
Sign up for a demo at https://vuestorefront.io/ (Vue Storefront integrated with Pimcore OR Magento2).

# WooCommerce indexer
This project provides indexer for *WooCommerce* data structures

The module is created as a standalone application which provides:
- gathering, processing and pushing: attributes, products and categories to Elasticsearch Search Engine (VSF Read model)

# Setup and installation
## Requirements 
- Node.js 8.2 or higher
- Running Elasticsearch 5.6+ (It's contained in whole VSF API stack)
- Running WooCommerce (tested on version 3.5.3)


## Pre-configuration on WooCommerce side
1. Make sure you have configured REST API properly, and REST API is publicly accessible
2. Generate *consumer key* and *consumer secret* in advenced tab in WooCommerce settings (read permissions are enough)
3. Having already installed VSF API, you should build an index with proper mapping for each type, you can achive this by
running at the VSF API project's root dir:
`
nodejs scripts/db.js new
`


## Configure WooCommerce REST API connection
In `config.js` there is a *woo* section when you should adjust some data, i.e. keys for REST requests:
```
woo: {
    api: {
      host: 'localhost',
      protocol: 'http',
      auth: {
        consumer_key: "",
        consumer_secret: "",
        version: "v3"
      }
    }
  },
```
> notice that version should stay the same.

## Configure Elasticsearch connection

In `db` section contained in `config.js` file you should adjust some info about ES:
```
  db: {
    host: 'localhost',
    port: 9200,
    driver: 'elasticsearch',
    url: 'http://localhost:9200',
    indexName: 'vue_storefront_catalog'
  },
```
> notice that indexName can be changed but it should stay consistent with VSF configuration. 

# Populate WooCommerce data in Elasticsearch
## Run indexers
Please execute indexers one by one with:
1. attributes: `nodejs cli.js attributes` 
2. categories: `nodejs cli.js categories`
3. products: `nodejs cli.js products`

and that's it. 

# For developers

## additional requirements
- docker
- docker-compose

## Run Wordpress with WooCommerce included (dockerized)
To simplify developing you can use one of existing tools, for instance: ready-to-use docker images nad wp-cli:
1. run containers by using `docker-compose.dev.yml` located in `dev/docker/` subdirectory: `docker-compose -f docker-compose.dev.yml up`
> it's recommended to run this command being inside `docker` dir, because of docker's networking naming conventions which will be used in further steps
2. install Wordpress fresh instance: `docker run -it --rm --volumes-from vsf_woo --network docker_default wordpress:cli wp core install --url="localhost" --title="VSFvsWoo" --admin_user="admin" --admin_email="developer@company.com" --admin_password=admin`
> notice what parameters should be passed with command above: network and volumes-from should cover names set in docker-compose.dev.yml
> it creates a new wordpress's instance available on `localhost` and with credentials `admin`/`admin`
3. install woocommerce plugin via wp-cli: `docker run -it --rm --volumes-from vsf_woo --network docker_default wordpress:cli wp plugin install woocommerce --activate`
4. add some attributes and options, running:
```
   docker run -it --rm --volumes-from vsf_woo --network docker_default wordpress:cli wp wc product_attribute create --name=Size --type=options --user=admin
   docker run -it --rm --volumes-from vsf_woo --network docker_default wordpress:cli wp wc product_attribute_term create 1 --name=XS --user=admin
   docker run -it --rm --volumes-from vsf_woo --network docker_default wordpress:cli wp wc product_attribute_term create 1 --name=L --user=admin
```
> wp-cli command `wc product_attribute_term create` requires as a first input an ID of attribute created at first step (in this case `1`)
5. add some products via cli or manually in wp-admin panel: 
```
docker run -it --rm --volumes-from vsf_woo --network docker_default wordpress:cli wp wc product create --name="Vue T-Shirt L" --type=simple --sku=VUE/T-shirt/L --regular_price=200 --user=admin --sale_price=150 --stock_quantity=94 --in_stock=true
```

> always pay attention to the arguments provided in commands above which can vary depending on WP/WooCommerce current state.

# Credits

This module has been initially created by Divante's team:
- Maciej Kucmus - @mkucmus

# Support

If You have any questions regarding this project feel free to contact us:
- [E-mail](mailto:contributors@vuestorefront.io),
- [Slack](http://slack.vuestorefront.io)

# Licence 
woocommerce2vuestorefront source code is completely free and released under the [MIT License](https://github.com/DivanteLtd/vue-storefront/blob/master/LICENSE).
