# GraphQL Interfaces

Storefront supports GraphQL to get data for products, categories, products, and taxerules.
The default GraphQL resolvers fetch the data from Elasticsearch. You can easily create custom schemas and resolvers for Search Engines / 3rd Party APIs

## GraphQL Schema

Our default GraphQL schema is defined in the [graphql](https://github.com/DivanteLtd/storefront-api/tree/develop/src/graphql/elasticsearch) folder.
Check the [Schema documentation](https://divanteltd.github.io/storefront-graphql-api-schema/)

## GraphQL Playground and queries

After launching the Storefront Api server there is a GraphQL API interface available under [http://localhost:8080/graphql](http://localhost:8080/graphql). You can use it for testing out some Graph QL queries.

You can find an example request for querying the products entity below:

```graphql
{
  products(search: "bag", filter: {
    status: {
      in: [0, 1], scope: "default"
    },
    stock: {
      is_in_stock: {eq: true, scope: "default"}
    },
    visibility: {
      in: [3, 4], scope: "default"}
  },
    sort: {
      updated_at: DESC
    }
  ) {
    items
    total_count
    aggregations
    sort_fields {
      options {
        value
      }
    }
    page_info {
      page_size
      current_page
    }
  }
}
```

<img src="https://divante.com/github/storefront-api/graphql-playground.png" alt="GraphQL Playground is included"/>
<em style="text-align:center;">This is a screen showing the GraphQL Playground on storefront-api schema. <a href="https://divanteltd.github.io/storefront-graphql-api-schema/">Check the schema docs</a>. It can be 100% customized.</em>

## Extending GraphQL schema

Of course you can modify the GraphQL schema and resolvers which are located in the [`graphql`](https://github.com/DivanteLtd/storefront-api/tree/develop/src/graphql/elasticsearch) directory. The other way around is to create your own [extensions](./extensions.md)

