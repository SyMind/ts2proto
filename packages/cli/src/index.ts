import { program, Command } from 'commander'
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
}

run()
