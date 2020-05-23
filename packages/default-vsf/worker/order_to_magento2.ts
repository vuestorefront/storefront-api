/**
 * CLI tool
 * Queue worker in charge of syncing the Sales order to Magento2 via REST API *
 */
import Logger from '@storefront-api/lib/logger';

const program = require('commander');
const kue = require('kue');

const config = require('config')
const queue = kue.createQueue(Object.assign(config.kue, { redis: config.redis }));

const numCPUs = require('os').cpus().length;
const processSingleOrder = require('@storefront-api/platform-magento2/o2m').processSingleOrder

// RUN
program
  .command('start')
  .option('--partitions <partitions>', 'number of partitions', numCPUs)
  .action((cmd) => { // default command is to run the service worker
    const partitionCount = parseInt(cmd.partitions);
    Logger.info(`Starting KUE worker for "order" message [${partitionCount}]...`);
    queue.process('order', partitionCount, (job, done) => {
      Logger.info('Processing order: ' + job.data.title);
      return processSingleOrder(job.data.order, config, job, done);
    });
  });

program
  .command('testAuth')
  .action(() => {
    processSingleOrder(require('var/testOrderAuth.json'), config, null);
  });

program
  .command('testAnon')
  .action(() => {
    processSingleOrder(require('var/testOrderAnon.json'), config, null);
  });

program
  .on('command:*', () => {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
  });

program
  .parse(process.argv)
