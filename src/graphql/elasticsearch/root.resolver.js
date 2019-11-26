
const resolver = {
  Query: {
    version: (_, { search }, context, rootValue) => { return process.env.npm_package_version } // entry point for product extensions
  },
  ESResponseInterface: {
    __resolveType () {
      return null;
    }
  }
};

export default resolver;
