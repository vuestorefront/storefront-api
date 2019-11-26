
const resolver = {
  Query: {
    version: (_, { search }, context, rootValue) => { return process.env.npm_package_version } // entry point for product extensions
  }
};

export default resolver;
