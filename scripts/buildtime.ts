import fs from 'fs'

const build = { time: Date.now() }
fs.writeFileSync('config/build.json', JSON.stringify(build))
