# Platform concept

Our default modules (`default-catalog`, `default-img`, `default-vsf`) implement the abstract platform concept. Here is how it works:

## Select platform in the configuration

The `local.json` and `default.json` files include the platform property:

```json
  "platform": "magento2",
```

The config file is also prepared for storing some additional platform-related information ([example](https://github.com/DivanteLtd/storefront-api/blob/a66222768bf7fb5f54acf268b6a0bb4e0f94a4cf/config/default.json#L201)).


## Create a driver

Based on this setting, [Storefront API Platform Factory](https://github.com/DivanteLtd/storefront-api/blob/develop/src/platform/factory.ts) selects the [backend platform driver](https://github.com/DivanteLtd/storefront-api/blob/a66222768bf7fb5f54acf268b6a0bb4e0f94a4cf/src/modules/default-vsf/api/cart.js#L10).

Then, the Express.js API handler ([example](https://github.com/DivanteLtd/storefront-api/blob/a66222768bf7fb5f54acf268b6a0bb4e0f94a4cf/src/modules/default-vsf/api/cart.js#L20)) calls the proper request handler.

**Note:** The platform driver is in charge of adapting the input and output data from the normalized (platform agnostic) data formats to the platform specific format. It usually calls the [platform specific API](https://github.com/DivanteLtd/storefront-api/blob/a66222768bf7fb5f54acf268b6a0bb4e0f94a4cf/src/platform/magento2/order.js#L10) inside.
