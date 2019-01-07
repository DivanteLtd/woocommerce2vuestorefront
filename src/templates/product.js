const attributeCache = []
const attributeOptionsCache = []
const optionTermsCache = []

const extractCategories = (categories) => {
  let output = []

  for (let category of categories) {
    output.push({
      category_id: category.id
    })
  }

  return output
}

const appendAttributeOptionsArray = async (attributes, dataToAppend, apiConnector, logger) => {

  logger.info(`appending attributes' config arrays...`)

  for (let attribute of attributes) {
    let options = []
    if (attributeOptionsCache[`${attribute.name.toLowerCase()}_options`]) {
      logger.info(`options array found in cache (attribute id ${attribute.id}`)
      options = attributeOptionsCache[`${attribute.name.toLowerCase()}_options`]
    } else {
      logger.info(`options array not cached (attribute id ${attribute.id}`)
      dataToAppend[`${attribute.name.toLowerCase()}_options`] = []
      let termsResponse = await apiConnector.getAsync(`products/attributes/${attribute.id}/terms`)
      let response = termsResponse.toJSON().body
      options = JSON.parse(response)
    }

    for (let term of options) {
      dataToAppend[`${attribute.name.toLowerCase()}_options`].push(term.id)
    }
  }

  return dataToAppend
}

const appendAttributeOptions = async (attributes, dataToAppend, apiConnector, logger) => {

  logger.info(`appending options... ${dataToAppend.sku}`)
  for (let attribute of attributes) {
    let termsDetails = []
    if (optionTermsCache[attribute.id]) {
      logger.info(`attribute options found in cache (attribute id ${attribute.id}`)
      termsDetails = optionTermsCache[attribute.id]
    } else {
      logger.info(`attribute options not cached (attribute id ${attribute.id}`)
      let termsResponse = await apiConnector.getAsync(`products/attributes/${attribute.id}/terms`)
      let response = termsResponse.toJSON().body
      termsDetails = JSON.parse(response)
      optionTermsCache[attribute.id] = termsDetails
    }

    for (let term of termsDetails) {
      if (attribute.option === term.name) {
        logger.info(`appending options... ${attribute.name.toLowerCase()}: ${term.name}`)
          dataToAppend[attribute.name.toLowerCase()] = term.id
      }
    }
  }

  return dataToAppend
}

const extractConfigurableChildren = async (productId, variations, apiConnector, logger) => {
    let output = []
    logger.info(`processing variations... (${variations.length})`)
    for (let variation of variations) {
      let variationData = {
        "sku": variation.sku,
        "price": variation.price,
        "image": variation.image.src,
        "is_salable": (variation.in_stock && variation.purchasable),
        "product_id": productId,
      }

      await appendAttributeOptions(variation.attributes, variationData, apiConnector, logger)
      output.push(variationData)
    }

    return output;
}

const extractConfigurableOptions = async (attributes, apiConnector, logger) => {
    let output = [];
    logger.info(`processing configurable options...`)
    let attributeData = {}

    for (let attribute of attributes) {
      if (attributeCache[attribute.id]) {
        logger.info(`attribute data found in cache (attribute id ${attribute.id}, name ${attribute.name}`)
        attributeData = attributeCache[attribute.id]
      } else {
        logger.info(`attribute data not cached (attribute id ${attribute.id}, name ${attribute.name}`)
        let attributeDetailsResponse = await apiConnector.getAsync(`products/attributes/${attribute.id}`)

        let response = attributeDetailsResponse.toJSON().body
        let attributeDetails = JSON.parse(response)
        attributeData = {
          "attribute_id": attribute.id,
          "values": [],
          "id": `${attribute.id}`,
          "label": attribute.name,
          "position": attribute.position,
          "attribute_code": attributeDetails.slug.replace('pa_',''),
        }
        let result = await apiConnector.getAsync(`products/attributes/${attribute.id}/terms`)

        let body = result.toJSON().body
        let options = JSON.parse(body)

        attributeData.values = options.map((option) => {
          return {
            value_index: option.id
          }
        })

        attributeCache[attribute.id] = attributeData
      }

      output.push(attributeData)
    }

  return output
}


const fill = async (source, { apiConnector, elasticClient, config, logger }) => {
  logger.info(`-------------------------------------------\nStarted processing parent product ${source.id} with sku ${source.sku}`)
  let {
    id,
    description,
    slug,
    sku,
    date_created,
    date_modified,
    name,
    price,
    regular_price,
    attributes,
    catalog_visibility,
    in_stock,
    weight,
    tax_class,
    permalink,
    on_sale,
    images,
    grouped_products,
    categories,
    variations,
    timestamp
  } = source

  let output = {
    "timestamp": timestamp,
    "entity_type_id": 4,
    "attribute_set_id": 11,
    "type_id": variations && variations.length > 0 ? "configurable" : "simple",
    "sku": sku,
    "has_options": variations && variations.length,
    "required_options": 0,
    "created_at":'2018-10-01 12:03:19',
    "updated_at": '2018-10-01 12:03:19',
    "color": null,
    "gender": null,
    "material": 138,
    "luggage_size": null,
    "luggage_travel_style": null,
    "bag_luggage_type": 153,
    "jewelry_type": null,
    "status": 1,
    "accessories_size": null,
    "visibility": 4,//catalog_visibility === 'visible' ? 4 : 0,
    "tax_class_id": tax_class,
    "is_recurring": false,
    "description": description,
    "meta_keyword": null,
    "short_description": "",
    "custom_layout_update": null,
    "accessories_type": "",
    "luggage_style": "",
    "name": name,
    "meta_title": null,
    "image": typeof (images[0]==='Object' && images[0]) ? images[0].src : '',
    "custom_design": null,
    "gift_message_available": null,
    "small_image": "",
    "gift_wrapping_available": 0,
    "meta_description": null,
    "thumbnail": typeof (images[0]==='Object' && images[0]) ? images[0].src : '',
    "media_gallery": images ? images.map(si => {  return { image: si.src } }) : null,
    "gallery": null,
    "page_layout": "",
    "options_container": "",
    "url_key": slug,
    "country_of_manufacture": null,
    "msrp_enabled": 2,
    "msrp_display_actual_price_type": 4,
    "url_path": slug,
    "image_label": null,
    "small_image_label": null,
    "thumbnail_label": null,
    "gift_wrapping_price": null,
    "weight": weight,
    "price": regular_price ? regular_price : price,
    "special_price": on_sale ? price : null,
    "final_price": regular_price ? regular_price : price,
    "msrp": null,
    "custom_design_from": null,
    "custom_design_to": null,
    "news_from_date": null,
    "news_to_date": null,
    "special_from_date": null,
    "special_to_date": null,
    "is_salable": true,
    "stock_item": {
      "is_in_stock": true // TODO
    },
    "id": id,
    "category": extractCategories(categories),
    "category_ids": extractCategories(categories).map((value, index) => value.category_id),
    "stock":{
      "is_in_stock": true
    },
    "configurable_children": variations ? await extractConfigurableChildren(source.id, variations, apiConnector(config), logger) : null,
    "configurable_options": attributes ? await extractConfigurableOptions(attributes, apiConnector(config), logger): null
  }

  await appendAttributeOptionsArray(attributes, output, apiConnector(config), logger)

  return output;
}

module.exports = {
  fill
}