import { program } from 'commander'
import { glob } from 'glob'
import { transform } from '@ts2proto/core'
import { version } from '../package.json'

program
  .version(version)
  .usage('[options] <file|directory>')

program.on('--help', () => {
  console.log(`
  Examples:
    ts2proto foo.ts
  `)
})

program.parse(process.argv)

async function run() {
  const rootNames = program.args.reduce<string[]>((globbed, input) => {
    let files = glob.sync(input)
    if (!files.length) files = [input]
    return [...globbed, ...files]
  }, [])

  const resutl = transform(rootNames)
  console.log(resutl)
}

run()
