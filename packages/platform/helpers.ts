import config from 'config'
export function getCurrentPlatformConfig (): any {
  const currentPlatform: string = config.get('platform')
  return config.get(currentPlatform)
}
