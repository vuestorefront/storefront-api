import path from 'path'

export default async function loadModuleCustomFilters (config: Record<string, any>, type = 'catalog'): Promise<any> {
  const filters: any = {}
  const filterPromises: Promise<any>[] = []

  for (const mod of config.modules.defaultCatalog.registeredExtensions) {
    if (Object.prototype.hasOwnProperty.call(config.extensions, mod) && Object.prototype.hasOwnProperty.call(config.extensions[mod], type + 'Filter') && Array.isArray(config.extensions[mod][type + 'Filter'])) {
      const moduleFilter = config.extensions[mod][type + 'Filter']
      const dirPath = [__dirname, '../api/extensions/' + mod + '/filter/', type]
      for (const filterName of moduleFilter) {
        const filePath = path.resolve(...dirPath, filterName)
        filterPromises.push(
          import(filePath)
            .then(module => {
              filters[filterName] = module.default
            })
            .catch(e => {
              console.log(e)
            })
        )
      }
    }
  }

  return Promise.all(filterPromises).then(() => filters)
}
