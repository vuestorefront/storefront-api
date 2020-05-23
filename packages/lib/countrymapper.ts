function mapCountryRegion (countryList, countryId, regionCode) {
  const regionId = 0
  for (const country of countryList) {
    if (country.id === countryId) {
      if (country.available_regions && country.available_regions.length > 0) {
        for (const region of country.available_regions) {
          if (region.code === regionCode) {
            return { regionId: region.id, regionCode: region.code }
          }
        }
      }
    }
  }
  return { regionId: regionId, regionCode: '' }
}

export {
  mapCountryRegion
}
