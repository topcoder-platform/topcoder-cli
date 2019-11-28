#!/usr/bin/env node

const program = require('commander')
const submissionHandler = require('../src/commands/submit')
const payHandler = require('../src/commands/pay')
const configHandler = require('../src/commands/config')
const logger = require('../src/common/logger')

// Overall help text which will be displayed after usage information
program.on('--help', () => {
  console.log(`\nTopcoder CLI to interact with Topcoder systems\n`)
})

program
  .command('submit')
  .description('Submit the contents of current working directory to Topcoder challenge(s)')
  .option('-u, --username <uname>', 'Topcoder username')
  .option('-p, --password <password>', 'Topcoder password')
  .option('-m, --memberId <memberid>', 'Admin submitting on behalf of other member will use the member id')
  .option('-c, --challengeIds <ids>', 'Comma separated challenge IDs to which submission need to be done')
  .option('--dev', 'Points to Topcoder development environment')
  .on('--help', () => {
    console.log(`\nEither use CLI parameters or Create a file .topcoderrc in JSON format with below details
    {
      "challengeIds": [
        "30095545" // at least one item here
      ],
      "username": "<Topcoder username>",
      "password": "<Topcoder password>"
    }
    and execute command \`topcoder submit\` to submit the contents of current working directory except .topcoderrc file to the challenge`)
  }).action((args) => {
    try {
      if (args.dev) {
        process.env.NODE_ENV = 'dev'
      }
      submissionHandler(program.args[0])
    } catch (error) {
      logger.error(error)
      logger.error(error.message)
    }
  })

program
  .command('config')
  .description('Setup global configuration for the Topcoder CLI')
  .option('-l --list', 'Print the keys in the config file')
  .option('-a --add <key> <value>', 'Add / Replace a key in the config file.')
  .option('--unset <key>', 'Removes a key from the config file')
  .action((...args) => {
    try {
      configHandler.handleSubCommand(args)
    } catch (error) {
      logger.error(error.message)
    }
  })

program
  .command('pay')
  .description('Let copilot/managers process private task payments')
  .option('-o --copilot <payment>', 'copilot payment.')
  .option('--dev', 'Points to Topcoder development environment')
  .action((...args) => {
    if (args.dev) {
      process.env.NODE_ENV = 'dev'
    }
    payHandler.handleCommand(args)
  })

// error on unknown commands
program.on('command:*', function () {
  console.error('Invalid command: %s\nEnter topcoder --help for the list of available commands.', program.args.join(' '))
  process.exit(1)
})

program.parse(process.argv)

// If the CLI is invoked without any command, display help
if (process.argv.length < 3) {
  program.help()
}
