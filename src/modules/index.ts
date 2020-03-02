import { DefaultVuestorefrontApiModule } from '@storefront-api/default-vsf'
import { DefaultCatalogModule } from '@storefront-api/default-catalog'
import { DefaultImgModule } from '@storefront-api/default-img'
import { SampleApiModule } from './sample-api'
import { TemplateModule } from './template-module'
import {StorefrontApiModule} from '@storefront-api/lib/module'
import * as magento2 from '@storefront-api/platform-magento2'

export let modules: StorefrontApiModule[] = [
  DefaultVuestorefrontApiModule({
    platform: {
      name: 'magento2',
      platformImplementation: magento2
    }
  }),
  DefaultCatalogModule(),
  DefaultImgModule(),
  SampleApiModule,
  TemplateModule
]

export default modules
