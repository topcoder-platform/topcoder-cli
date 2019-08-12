#!/usr/bin/env node
process.env.NODE_CONFIG_DIR = `${__dirname}/../config/`

const program = require('commander')
const uploadSubmissionService = require('../src/services/uploadSubmissionService')
const logger = require('../src/common/logger')

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

program.parse(process.argv)

uploadSubmissionService.smart(process.cwd())
  .then(() => {
    logger.info('done!')
    process.exit()
  })
  .catch(err => {
    logger.error(err.message)
    process.exit(1)
  })
