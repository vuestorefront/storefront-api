# GraphQL Interfaces

Storefront supports GraphQL to get data for: `products`, `categories`, `attributes` and `taxerules`.
The default GraphQL resolvers fetch the data from Elasticsearch. You can easily create custom schemas and resolvers for Search Engines / Third Party APIs.

## GraphQL Schema

Our default GraphQL schema is defined the within the [modules](../modules/introduction.md). By default, we provide the `default-catalog` module. It contains a pretty comprehensive eCommerce schema that can be easily modified to suit your needs. Check the [Default schema documentation](https://divanteltd.github.io/storefront-graphql-api-schema/).

## GraphQL Playground and queries

After launching the Storefront API server, there is a GraphQL API interface available at [http://localhost:8080/graphql](http://localhost:8080/graphql). You can use it for testing out some Graph QL queries.

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

The default schema can be easily modified by just tweaking the `modules/default-catalog/graphql/*` definitions. You can add your own custom [modules](../modules/introduction.md) that define custom GraphQL schema. In the same way, you can disable the `default-catalog` module if you don't want to use our default entities.

[Check the tutorial](../modules/tutorial.md) on how to extend GraphQL schema.
