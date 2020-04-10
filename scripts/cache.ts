import program from 'commander'
import config from 'config'
import cache from 'packages/lib/cache-instance'

program
  .command('clear')
  .option('-t|--tag <tag>', 'tag name, available tags: ' + config.get<string[]>('server.availableCacheTags').join(', '), '*')
  .action((cmd) => { // TODO: add parallel processing
    if (!cmd.tag) {
      console.error('error: tag must be specified')
      process.exit(1)
    } else {
      console.log(`Clear cache request for [${cmd.tag}]`)
      let tags = []
      if (cmd.tag === '*') {
        tags = config.get<string[]>('server.availableCacheTags')
      } else {
        tags = cmd.tag.split(',')
      }
      const subPromises = []
      tags.forEach(tag => {
        if (config.get<string[]>('server.availableCacheTags').indexOf(tag) >= 0 || config.get<string[]>('server.availableCacheTags').find(t => {
          return tag.indexOf(t) === 0
        })) {
          subPromises.push(cache.invalidate(tag).then(() => {
            console.log(`Tags invalidated successfully for [${tag}]`)
          }))
        } else {
          console.error(`Invalid tag name ${tag}`)
        }
      })
      Promise.all(subPromises).then(r => {
        console.log(`All tags invalidated successfully [${cmd.tag}]`)
        process.exit(0)
      }).catch(error => {
        console.error(error)
      })
    }
  })

program.parse(process.argv)
