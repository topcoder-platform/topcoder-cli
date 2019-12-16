#!/usr/bin/env node

const { Command } = require('commander')
const submissionHandler = require('../src/commands/submit')
const payHandler = require('../src/commands/pay')
const configHandler = require('../src/commands/config')
const fetchSubmissionHandler = require('../src/commands/fetchSubmissions')
const fetchArtifactsHandler = require('../src/commands/fetchArtifacts')
const logger = require('../src/common/logger')

const docs = {
  submit: `\nEither use CLI parameters or Create a file .topcoderrc in JSON ` +
  `format with below details\n` +
  `{\n` +
  `  "memberId": "<Topcoder memberId",\n` +
  `  "challengeIds": [\n` +
  `    "30095545" // at least one item here\n` +
  `  ],\n` +
  `  "username": "<Topcoder username>",\n` +
  `  "password": "<Topcoder password>",\n` +
  `  "m2m": {\n` +
  `    "client_id": "<Client ID for M2M authentication>",\n` +
  `    "client_secret": "<Client Secret for M2M authentication>"\n` +
  `  }\n` +
  `}\n` +
  `and execute command \`topcoder submit\` to submit the contents of ` +
  `current working directory except .topcoderrc file to the challenge.\n` +
  `You'd need either the m2m config or the username and password, but ` +
  `not both.`,
  'fetch-submissions': `\nUse CLI parameters or create a file .topcoderrc in JSON format with below details\n` +
  `{\n` +
  `  "memberId": "<Topcoder memberId",\n` +
  `  "challengeId": "<Topcoder challengeId",\n` +
  `  "submissionId": "<Topcoder submissionId",\n` +
  `  "latest": true,\n` +
  `  "username": "<Topcoder username>",\n` +
  `  "password": "<Topcoder password>",\n` +
  `  "m2m": {\n` +
  `    "client_id": "<Client ID for M2M authentication>",\n` +
  `    "client_secret": "<Client Secret for M2M authentication>"\n` +
  `  }\n` +
  `}\n` +
  `and execute command \`topcoder fetch-submissions\` to fetch submissions ` +
  `for a challenge and save them.\n` +
  `You may specify the m2m config or the username and password config, ` +
  `but not both.\n` +
  `If the submissionId parameter is provided, you must not provide the ` +
  `memberId or the latest parameters.\n` +
  `The challengeId parameter is always required.`,
  'fetch-artifacts': `\nUse CLI parameters or create a file .topcoderrc in JSON format ` +
  `with below details\n` +
  `{\n` +
  `  "submissionId": "<Topcoder submissionId>",\n` +
  `  "legacySubmissionId": "<Topcoder legacySubmissionId>",\n` +
  `  "username": "<Topcoder username>",\n` +
  `  "password": "<Topcoder password>",\n` +
  `  "m2m": {\n` +
  `    "client_id": "<Client ID for M2M authentication>",\n` +
  `    "client_secret": "<Client Secret for M2M authentication>"\n` +
  `  }\n` +
  `}\n` +
  `and execute command \`topcoder fetch-artifacts\` to fetch submissions for` +
  ` a challenge and save them.\n` +
  `You may specify the m2m config or the username and password config, ` +
  `but not both.\n` +
  `If the submissionId parameter is provided, you must not provide the the ` +
  `legacySubmissionId parameters, and vice-versa.`

}

const program = new Command()

// Overall help text which will be displayed after usage information
program.on('--help', () => {
  console.log('\nTopcoder CLI to interact with Topcoder systems\n')
})

program
  .command('submit')
  .description(
    'Submit the contents of current working directory to Topcoder challenge(s)'
  )
  .option('-u, --username <username>', 'Topcoder username')
  .option('-p, --password <password>', 'Topcoder password')
  .option(
    '-m, --memberId <memberId>',
    'Admin submitting on behalf of other member will use the member id'
  )
  .option(
    '-c, --challengeIds <ids>',
    'Comma separated challenge IDs to which submission need to be done'
  )
  .option('--dev', 'Points to Topcoder development environment')
  .on('--help', () => {
    console.log(docs.submit)
  })
  .action(async args => {
    try {
      if (args.dev) {
        process.env.NODE_ENV = 'dev'
      }
      await submissionHandler(program.args[0])
    } catch (error) {
      logger.error(error.message)
    }
  })

program
  .command('fetch-submissions')
  .description('Command to fetch submissions for a challenge and save them.')
  .option('-u, --username <username>', 'Topcoder username')
  .option('-p, --password <password>', 'Topcoder password')
  .option(
    '-c, --challengeId <id>',
    'Challenge ID for submissions to be fetched'
  )
  .option(
    '-m, --memberId <id>',
    'Fetch only the submission of for a particular member id'
  )
  .option(
    '-s, --submissionId <id>',
    'Fetch only the submission with a particular submission id'
  )
  .option('-l, --latest', 'fetch only the latest submission of each member')
  .option('--dev', 'Points to Topcoder development environment')
  .on('--help', () => {
    console.log(docs['fetch-submissions'])
  })
  .action(async args => {
    try {
      if (args.dev) {
        process.env.NODE_ENV = 'dev'
      }
      await fetchSubmissionHandler(program.args[0])
    } catch (error) {
      logger.error(error.message)
    }
  })

program
  .command('fetch-artifacts')
  .description('Command to fetch artifacts for a challenge and save them.')
  .option('-u, --username <username>', 'Topcoder username')
  .option('-p, --password <password>', 'Topcoder password')
  .option(
    '-s, --submissionId <id>',
    'Fetch only the submission with a particular submission id'
  )
  .option(
    '-L, --legacySubmissionId <id>',
    'Fetch only the submission with a particular (legacy) submission id'
  )
  .option('--dev', 'Points to Topcoder development environment')
  .on('--help', () => {
    console.log(
      docs['fetch-artifacts']
    )
  })
  .action(async args => {
    try {
      if (args.dev) {
        process.env.NODE_ENV = 'dev'
      }
      await fetchArtifactsHandler(program.args[0])
    } catch (error) {
      logger.error(error.message)
    }
  })

program
  .command('config')
  .description('Setup global configuration for the Topcoder CLI')
  .option('-l --list', 'Print the keys in the config file')
  .option('-a --add <key> <value>', 'Add / Replace a key in the config file.')
  .option('--unset <key>', 'Removes a key from the config file')
  .action(async (...args) => {
    try {
      await configHandler.handleSubCommand(args)
    } catch (error) {
      logger.error(error.message)
    }
  })

program
  .command('pay')
  .description('Let copilot/managers process private task payments')
  .option('-o --copilot <payment>', 'copilot payment.')
  .option('--dev', 'Points to Topcoder development environment')
  .action(async args => {
    if (args.dev) {
      process.env.NODE_ENV = 'dev'
    }
    await payHandler.handleCommand(program.args)
  })

// error on unknown commands
program.on('command:*', function () {
  console.error(
    'Invalid command: %s\nEnter topcoder --help for the list of available ' +
      'commands.',
    program.args.join(' ')
  )
  process.exit(1)
})

/* istanbul ignore next */
if (!module.parent) {
  program.parse(process.argv)
  // If the CLI is invoked without any command, display help
  if (process.argv.length < 3) {
    program.help()
  }
}

module.exports = {
  program,
  docs
}
