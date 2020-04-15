// @ts-ignore
import { getCurrentPlatformConfig } from '@storefront-api/platform/helpers'
import { list as listProductReviews } from '../review/resolver'
import { list, listSingleProduct } from './service'
import { list as listCategories, listBreadcrumbs } from '../category/service';

const resolver = {
  Query: {
    products: (_, { search, filter, sort, currentPage, pageSize, _sourceIncludes, _sourceExcludes }, context, rootValue) =>
      list({ filter, sort, currentPage, pageSize, search, context, rootValue, _sourceIncludes, _sourceExcludes }),
    product: (_, { sku, id, url_path, _sourceIncludes, _sourceExcludes }, context, rootValue) =>
      listSingleProduct({ sku, id, url_path, context, rootValue, _sourceIncludes, _sourceExcludes })
  },
  Products: {
    items: async (_, { search }, context, rootValue) => { return _.items } // entry point for product extensions
  },
  BundleOptionLink: {
    product: (_, params, context, rootValue) =>
      listSingleProduct({ sku: _.sku, context, rootValue })
  },
  Product: {
    reviews: (_, { search, filter, currentPage, pageSize, sort, _sourceIncludes, _sourceExcludes }, context, rootValue) => {
      return listProductReviews({ search, filter: Object.assign({}, filter, { product_id: { in: _.id } }), currentPage, pageSize, sort, context, rootValue, _sourceIncludes, _sourceExcludes })
    },
    categories: async (_, { pageSize }, context) => {
      const filter = {
        id: { in: _.category_ids }
      }
      const response = await listCategories({
        search: '',
        filter,
        currentPage: 0,
        pageSize,
        sort: null,
        context,
        _sourceIncludes: null
      })
      const categoryList = (response && response.items) || []

      return categoryList
    },
    breadcrumbs: async (_, { search }, context) => {
      const filter = {
        id: { in: _.category_ids }
      }
      const response = await listCategories({
        search: '',
        filter,
        currentPage: 0,
        sort: null,
        context,
        _sourceIncludes: ['id', 'path', 'level', 'parent_ids', 'name', 'slug']
      })
      const categoryList = (response && response.items) || []
      const breadcrumbCategory = categoryList.sort((a, b) => b.level - a.level)[0] // sort starting by deepest level
      const breadcrumbs = await listBreadcrumbs({
        category: breadcrumbCategory,
        context,
        addCurrentCategory: true
      })

      return breadcrumbs
    },
    /*
    price_range: (_, { search }, context, rootValue) => {
      return {
        minimum_price: {
          regular_price: {},
          final_price: {},
          discount: {}
        },
        maximum_price: {
          regular_price: {},
          final_price: {},
          discount: {}
        }
      }
    }, */
    media_gallery: (_, { search }, context, rootValue) => {
      if (_.media_gallery) {
        return _.media_gallery.map(mItem => {
          return {
            image: mItem.image,
            vid: mItem.vid,
            typ: mItem.typ,
            url: `${getCurrentPlatformConfig().imgUrl}${mItem.image}`,
            label: mItem.lab,
            video: mItem.vid,
            type: mItem.typ
          }
        })
      } else {
        return []
      }
    } // entry point for product extensions
  }
};

export default resolver;
