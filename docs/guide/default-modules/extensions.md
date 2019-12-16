# Extensions

Storefront API evolved out of [Vue Storefront API](https://github.com/DivanteLtd/vue-storefront-api) which supported the concept of API extensions. Initially, it was just an additional Express.js handler mounted to a specific URL.

We thought it might be useful for developers to have the same functionality within their modules. We've added a [`registerExtensions`](https://github.com/DivanteLtd/storefront-api/blob/a66222768bf7fb5f54acf268b6a0bb4e0f94a4cf/src/modules/template-module/index.ts#L29) helper that is in charge of loading the modules from `src/module/your-custom-module/api/extensions`.

