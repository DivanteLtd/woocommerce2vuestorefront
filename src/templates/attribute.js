const config = require('../../config')
const WooCommerceAPI = require('woocommerce-api');

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

const extractOptions = async (attributeId) => {

  let result = await connector().getAsync(`products/attributes/${attributeId}/terms`)
  //logger.info(result.toJSON())
  let parsed = JSON.parse(result.toJSON().body)


  let options = []
  if (parsed.length > 0) {

    for (let option of parsed) {
      options.push({
        value: option.id,
        label: option.name
      })
    }
  }

  return options
}



const fill = async (source) => {
  let {
    id,
    name,
    slug,
    type
  } = source


  let output =  {
    "entity_type_id": 4,
    "attribute_code": slug.replace('pa_', ''),
    "attribute_model": null,
    "backend_model": null,
    "backend_type": "int",
    "backend_table": null,
    "frontend_model": null,
    "frontend_input": type,
    "frontend_label": name,
    "frontend_class": null,
    "source_model": "eav/entity_attribute_source_table",
    "is_required": false,
    "is_user_defined": true,
    "default_value": "",
    "is_unique": false,
    "note": null,
    "attribute_id": id,
    "frontend_input_renderer": null,
    "is_global": true,
    "is_visible": true,
    "is_searchable": true,
    "is_filterable": 1,
    "is_comparable": false,
    "is_visible_on_front": true,
    "is_html_allowed_on_front": true,
    "is_used_for_price_rules": false,
    "is_filterable_in_search": false,
    "used_in_product_listing": 0,
    "used_for_sort_by": 0,
    "is_configurable": true,
    "apply_to": "simple,grouped,configurable",
    "is_visible_in_advanced_search": false,
    "position": 0,
    "is_wysiwyg_enabled": false,
    "is_used_for_promo_rules": false,
    "search_weight": 1,
    "id": id,
    "options": await extractOptions(id)
  }

  //output.options =

  return output

}

module.exports = {
  fill
}