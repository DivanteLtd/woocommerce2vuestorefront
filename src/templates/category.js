const config = require('../../config')
const WooCommerceAPI = require('woocommerce-api');
const Entities = require('html-entities').AllHtmlEntities;

const entities = new Entities();

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

const extractSubcategories = async (parent_id) => {

  let result = await connector().getAsync(`products/categories?parent=${parent_id}`)
  let parsed = JSON.parse(result.toJSON().body)
  let subcats = []
  if (parsed.length > 0) {
    for (let child of parsed) {
      parsed.parent_id = parsed.parent_id ? parsed.parent_id : 1;

      let childData = {
        "entity_type_id": 3,
        "attribute_set_id": 0,
        "parent_id": parsed.parent_id,
        "created_at": "2018-10-12",
        "updated_at": "2018-10-12",
        "position": 1,
        "level": 2,
        "children_count": 1,
        "available_sort_by": null,
        "include_in_menu": true,
        "name": entities.decode(child.name),
        "id": child.id,
        "children_data": child.id !== parent_id && await extractSubcategories(child.id),
        "is_anchor": true,
        "is_active": true,
        "path": `1/2/${child.id}`,
        "url_key":  child.slug,
        "url_path":  child.id,
        "product_count": 10,
      }

      childData.children_count = childData.children_data.length
      subcats.push(childData)
    }
  }

  return subcats

}



const fill = async ({ id,
                      description,
                      name,
                      parent,
                      slug
                    },
                    {
                      logger
                    }
                    ) => {

  let output = {
    "entity_type_id": 3,
    "attribute_set_id": 0,
    "parent_id": 0,
    "created_at": "2018-10-12",
    "updated_at": "2018-10-12",
    "is_active": true,
    "position": 1,
    "level": 2,
    "children_count": 1,
    "available_sort_by": null,
    "include_in_menu": true,
    "name": entities.decode(name),
    "id": id,
    "is_anchor": true,
    "path": `1/${id}`,
    "url_key": slug,
    "url_path": slug,
    "product_count": 10,
    "children_data": await extractSubcategories(parseInt(id)),
  };

  output.children_count = output.children_data.length;

  return output;
}

module.exports = {
  fill
}