import AttributeService from '../../../api/attribute/service'
import { IConfig } from 'config'

export async function aggregationsToAttributes (response: { aggregations: any, attribute_metadata: {
  is_visible_on_front: any,
  is_visible: any,
  default_frontend_label: any,
  attribute_id: any,
  entity_type_id: any,
  id: any,
  is_user_defined: any,
  is_comparable: any,
  attribute_code: any,
  slug: any,
  options: any
}[]
}, config: IConfig, esIndex: string) {
  if (response.aggregations && config.get('entities.attribute.loadByAttributeMetadata')) {
    const attributeListParam = AttributeService.transformAggsToAttributeListParam(response.aggregations)
    const attributeList = await AttributeService.list(attributeListParam, config, esIndex)
    response.attribute_metadata = attributeList.map(AttributeService.transformToMetadata)
  }
  return response
}
