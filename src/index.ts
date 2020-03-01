import config from 'config';
import { Server } from '@storefront-api/core'
import modules from './modules';

const server = new Server({
  modules
})

server.start();

export default server;
