import config from 'config'

export default function getBoosts (attribute = '') {
  let boosts = []

  if (config.has('boost')) {
    boosts = config.get('boost')
  }

  if (Object.prototype.hasOwnProperty.call(boosts, attribute)) {
    return boosts[attribute]
  }

  return 1
}
