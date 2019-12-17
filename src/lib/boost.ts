import config from 'config'

export default function getBoosts (attribute: string = '') {
  let boosts = []

  if (config.has('boost')) {
    boosts = config.get('boost')
  }

  if (boosts.hasOwnProperty(attribute)) {
    return boosts[attribute]
  }

  return 1
}
