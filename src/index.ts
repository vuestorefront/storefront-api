import config from 'config';
import Logger from '@storefront-api/lib/logger'
import app, { hasGraphqlSupport } from './server';

const port = process.env.PORT || config.get<string>('server.port')
const host = process.env.HOST || config.get<string>('server.host')
app.listen(parseInt(port), host, () => {
  Logger.info(`Storefront GraphQL API started at http://${host}:${port}`);
  if (hasGraphqlSupport) {
    Logger.info(`Storefront GraphQL API started at http://${host}:${port}/graphql`);
  }
});

export default app;
