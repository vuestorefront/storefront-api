
const resolver = {
  Query: {
    version: (_, { search }, context, rootValue) => { return process.env.npm_package_version } // entry point for product extensions
  },
  ESResponseInterface: {
    // @todo find out why the double __ at the start of the function is needed
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __resolveType () {
      return null;
    }
  }
};

export default resolver;
