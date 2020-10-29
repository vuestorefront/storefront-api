import enabledModules from '../src/modules'
import Logger from '@storefront-api/lib/logger'
const program = require('commander')
const config = require('config')
const common = require('../migrations/.common')
const es = require('../packages/lib/elastic')
const { aggregateElasticSearchSchema } = require('../packages/lib/module/index')
const aggregatedSchema = aggregateElasticSearchSchema(enabledModules, { config })

const rebuildSchema = async (indexName, collectionName, timestamp) => {
  Logger.info('** Hello! I am going to rebuild EXISTING ES index to fix the schema')
  const originalIndex = indexName + '_' + collectionName;
  const tempIndex = originalIndex + '_' + timestamp

  Logger.info(`** Creating temporary index ${tempIndex}`)
  await es.createIndex(common.db, tempIndex, aggregatedSchema.schemas[collectionName])

  Logger.info(`** We will reindex ${originalIndex} with the current schema`)
  await es.reIndex(common.db, originalIndex, tempIndex)

  Logger.info('** Removing the original index')
  await es.deleteIndex(common.db, originalIndex)

  Logger.info('** Creating alias')
  await es.putAlias(common.db, tempIndex, originalIndex)
}

program
  .command('rebuild')
  .option('-i|--indexName <indexName>', 'name of the Elasticsearch index', config.elasticsearch.indices[0])
  .action(async (cmd) => { // TODO: add parallel processing
    if (!cmd.indexName) {
      Logger.error('error: indexName must be specified');
      process.exit(1);
    }
    const timestamp = Math.round(+new Date() / 1000)
    await Promise.all(
      Object.keys(aggregatedSchema.schemas).map((collectionName) => rebuildSchema(cmd.indexName, collectionName, timestamp))
    )
    process.exit(0)
  })

program
  .command('new')
  .option('-i|--indexName <indexName>', 'name of the Elasticsearch index', config.elasticsearch.indices[0])
  .action(async (cmd) => { // TODO: add parallel processing
    if (!cmd.indexName) {
      Logger.error('error: indexName must be specified');
      process.exit(1);
    }

    Logger.info('** Hello! I am going to create NEW ES index')
    const indexName = cmd.indexName

    for (const collectionName in aggregatedSchema.schemas) {
      await es.createIndex(common.db, indexName + '_' + collectionName, aggregatedSchema.schemas[collectionName])
    }
    process.exit(0)
  })

const getAlias = (db, indexName) => (collectionName) => db.indices.getAlias({
  name: indexName + '_' + collectionName
})

program
  .command('clear')
  .option('-i|--indexName <indexName>', 'name of the Elasticsearch index', config.elasticsearch.indices[0])
  .action(async (cmd) => { // TODO: add parallel processing
    if (!cmd.indexName) {
      Logger.error('error: indexName must be specified');
      process.exit(1);
    }

    const indexName = cmd.indexName
    try {
      const response = await Promise.all(
        Object.keys(aggregatedSchema.schemas).map(getAlias(common.db, indexName))
      )
      const indexesWithAlias = response.map((res) => Object.keys(res.body)[0])
      const indexesResponse = await common.db.cat.indices({ format: 'json' })
      const allindexes = indexesResponse.body.map(b => b.index)
        .filter(index => !indexesWithAlias.includes(index))
      await Promise.all(
        allindexes.map(index => es.deleteIndex(common.db, index))
      )
    } catch (err) {
      Logger.error(err)
    }
    process.exit(0)
  })

program
  .on('command:*', () => {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
  });

program
  .parse(process.argv)

process.on('unhandledRejection', (reason, p) => {
  Logger.error(`Unhandled Rejection at: Promise ${p}, reason: ${reason}`)
  // application specific logging, throwing an error, or other logic here
})

process.on('uncaughtException', (exception) => {
  Logger.error(exception) // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
})
