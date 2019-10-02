#!/usr/bin/env node
process.env.NODE_CONFIG_DIR = `${__dirname}/../config/`

const program = require('commander')
const submit = require('../src/commands/submit')
const pay = require('../src/commands/pay')
const config = require('../src/commands/config')
const logger = require('../src/common/logger')

program
  .option('-u, --username <uname>', 'Topcoder username')
  .option('-p, --password <password>', 'Topcoder password')
  .option('-c, --challengeIds <ids>', 'Comma separated challenge IDs to which submission need to be done')

program.on('--help', () => {
  console.log(`\nTopcoder CLI to create a new submission in the challenge 
  with contents from current directory\n`)
  console.log(`Create a file .topcoderrc in JSON format with below details 
  and execute command tc-submission-cli to create submission in the challenge`)
  console.log(`
  {
    "challengeIds": [
      "30095545" // at least one item here
    ],
    "username": "TonyJ",
    "password": "******"
  }`)
})

program
  .command('submit')
  .description('Create a challenge submission')
  .action(() => {
    try {
      submit(program)
    } catch (error) {
      logger.error(error.message)
    }
  })

program
  .command('config')
  .description('Set up/change globally configured config')
  .option('-l --list', 'Print out the config of the config file.')
  .option('-a --add <key> <value>', 'Adds a config to the config file.')
  .action((...args) => {
    try {
      config.handleSubCommand(args)
    } catch (error) {
      logger.error(error.message)
    }
  })

program
  .command('pay')
  .description('Let copilot/managers process private task payments')
  .option('-o --copilot <payment>', 'copilot payment.')
  .action((...args) => {
    pay.handleCommand(args)
  })

program.parse(process.argv)
