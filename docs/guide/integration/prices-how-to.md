# Prices how-to

To calculate the prices and taxes, we need first to get the proper tax rate. It's based on [`taxrate`](./integration.md#taxrate-entity) entity, stored in the Elastic. Each product can have the property `product.tax_class_id` fixed. Depending on its value Storefront API is applying the `taxrate`. It's also applying the country and region to the filter. 

**Note:** We're currently not supporting searching the tax rules by `customer_tax_class_id` neither by the `tax_postcode` fields of `taxrate` entity. Pull requests more than welcome ;)

After getting the right tax rate, we can calculate the prices.

We've got the following price fields priority in the VS:
- `final_price` - if set, depending on the `config.tax.finalPriceIncludesTax` - it's taken as final price or Net final price,
- `special_price` - if it's set and it's lower than `price` it will replace the `price` and the `price` value will be set into `original_price` property,
- `price` - if set, depending on the `config.tax.sourcePriceIncludesTax` - it's taken as final price or Net final price.

Depending on the `config.tax.finalPriceIncludesTax` and `config.tax.sourcePriceIncludesTax` settings Vue Storefront calculates the prices and stores them into following fields.

Product Special price:
- `special_price` - optional, if set - it's always Net price,
- `special_price_incl_tax` - optional, if set - it's always price after taxes,
- `special_price_tax` - optional, if set it's the tax amount.

Product Regular price:
- `price` - required, if set - it's always Net price,
- `price_incl_tax` - required, if set - it's always price after taxes,
- `price_tax` - required, if set it's the tax amount,

Product Final price:
- `final_price` - optional, if set - it's always Net price,
- `final_price_incl_tax` - optional, if set - it's always price after taxes,
- `final_price_tax` - optional, if set it's the tax amount,

Product Original price (set only if `final_price` or `special_price` are lower than `price`):
- `original_price` - optional, if set - it's always Net price,
- `original_price_incl_tax` - optional, if set - it's always price after taxes,
- `original_price_tax` - optional, if set it's the tax amount.

**Note:** The prices are set for all `configurable_children` with the same format
**Note:** If any of the `configurable_children` has the price lower than the main product, the main product price will be updated accordingly.