# Prices how-to

To calculate prices and taxes, we first need to get the proper tax rate. It's based on the [`taxrate`](./integration.md#taxrate-entity) entity, and stored in the Elastic. Each product can have the property `product.tax_class_id` fixed. According to its value, Storefront API applies the `taxrate`. It also applies the country and region to the filter. 

**Note:** We currently do not support searching the tax rules by `customer_tax_class_id` or by the `tax_postcode` fields of the `taxrate` entity. Pull requests are more than welcome ;)

After getting the right tax rate, we can calculate the prices.

We've got the following price fields priority in VS:
- `final_price` - if set, depending on the `config.tax.finalPriceIncludesTax`, it's taken as the final price or Net final price.
- `special_price` - if set and lower than the `price`, it will replace the `price` and the `price` value will be set into the `original_price` property.
- `price` - if set, depending on the `config.tax.sourcePriceIncludesTax`, it's taken as the final price or Net final price.

Depending on the `config.tax.finalPriceIncludesTax` and `config.tax.sourcePriceIncludesTax` settings, Vue Storefront calculates the prices and stores them into the following fields:

Product Special price:
- `special_price` - optional - if set, it's always the Net price.
- `special_price_incl_tax` - optional - if set, it's always the price after taxes.
- `special_price_tax` - optional - if set, it's the tax amount.

Product Regular price:
- `price` - required - if set, it's always the Net price.
- `price_incl_tax` - required - if set, it's always the price after taxes.
- `price_tax` - required - if set, it's the tax amount.

Product Final price:
- `final_price` - optional - if set, it's always the Net price.
- `final_price_incl_tax` - optional - if set, it's always the price after taxes.
- `final_price_tax` - optional - if set, it's the tax amount.

Product Original price (set only if `final_price` or `special_price` are lower than `price`):
- `original_price` - optional - if set, it's always the Net price.
- `original_price_incl_tax` - optional - if set, it's always the price after taxes.
- `original_price_tax` - optional - if set, it's the tax amount.

**Note:** The prices are set for all `configurable_children` with the same format.
**Note:** If any of the `configurable_children` has a price lower than the main product price, the main product price will be updated accordingly.
