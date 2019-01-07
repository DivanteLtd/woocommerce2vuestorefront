const removeFromElastic = async (object, entityName, { config, elasticClient, logger }) => {

  try {
      await elasticClient.delete({
        index: config.db.indexName,
        type: entityName,
        id: object._id
      })
    } catch (e) {
      logger.info(e)
    }
  }

  module.exports = removeFromElastic