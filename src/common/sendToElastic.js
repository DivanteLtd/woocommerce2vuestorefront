const sendToElastic = async (object, entityName, { config, elasticClient, logger }) => {
  logger.info(`I'm sending ${object.sku ? object.sku : ''} (${object.id})...`)
  try {
      await elasticClient.create({
        index: config.db.indexName,
        type: entityName,
        id: object.id,
        body: object
      })
      logger.info(`done (${object.id}).`)
      return true;
    } catch (e) {
      if (e.status === 409) { // document already exists; force update.
        await elasticClient.update({
          index: config.db.indexName,
          type: entityName,
          id: object.id,
          body: {
            doc: object
          }
        })
        logger.info(`done (${object.id}).`)
        return true
      }

      logger.warn(e)
      return false
    }
  }

  module.exports = sendToElastic