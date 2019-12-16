## Category entity

Please check the [sample-data/categories.json](https://github.com/DivanteLtd/storefront-api/blob/develop/integration-sdk/sample-data/categories.json) to be sure which fields are critical for Storefront API to work.

Remember - you can add any properties you like to the JSON objects to consume them on the Storefront API level. Please make sure you added the new property names to [the proper `includeFields` list for queries](https://github.com/DivanteLtd/vue-storefront/blob/bb6f8e70b5587ed73c457d382c7ac93bd14db413/config/default.json#L151).

Here we present the core purpose of the product properties:

```json
    "id": 24,
```
The type is undefined (it can be anything) - but must be unique. The category identifier is used mostly for caching purposes (as a key).

```json
    "parent_id": 21,
```

If this is a child category, please set the parent category id in here. This field is used for building up Breadcrumbs.

```json
    "path": "1/2/29",
```

This is a string, a list of IDs of the parent categories. It's used to build Breadcrumbs more easily.

```json
    "name": "Hoodies & Sweatshirts",
```

This is just a category name.

```json
    "url_key": "hoodies-and-sweatshirts-24",
    "url_path": "women/tops-women/hoodies-and-sweatshirts-women/hoodies-and-sweatshirts-24",
```

```json
    "is_active": true,
```

If it's false, the category won't be displayed.

```json
    "position": 2,
```

Sorting position of the category on its level.

```json
  "level": 4,
```

The category level in the tree. By default, Storefront API displays categories with `level: 2` in the main menu.

```json
    "product_count": 182,
```

If it's false, the category won't be displayed.

```json
    "children_data": [
      {
        "id": 27,
        "children_data": []
      },
      {
        "id": 28,
        "children_data": []
      }
    ]
```

Here is the children structure. It's used for constructing queries to get the child products.
