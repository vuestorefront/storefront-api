# Extensions

Storefront Api has been created out of the [Vue Storefront Api](https://github.com/DivanteLtd/vue-storefront-api) which supported the concept of API extensions. Initially it were just an additional Express.js handlers that can be mounted to specific URLs.

We thought it might be usefull for developers to have the same functionality within their modules. We've added a [`registerExtensions`](https://github.com/DivanteLtd/storefront-api/blob/a66222768bf7fb5f54acf268b6a0bb4e0f94a4cf/src/modules/template-module/index.ts#L29) helper that is in charge of loading the modules from `src/module/your-custom-module/api/extensions`.

