import { DefaultVuestorefrontApiModule } from './default-vsf'
import { DefaultCatalogModule } from './default-catalog'
import { DefaultImgModule } from './default-img'
import { SampleApiModule } from './sample-api'
import { TemplateModule } from './template-module'
import {StorefrontApiModule} from '@storefront-api/lib/module'

export let modules: StorefrontApiModule[] = [
  DefaultVuestorefrontApiModule,
  DefaultCatalogModule,
  DefaultImgModule,
  SampleApiModule,
  TemplateModule
]

export default modules
