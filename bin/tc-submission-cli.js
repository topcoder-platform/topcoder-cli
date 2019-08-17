#!/usr/bin/env node
process.env.NODE_CONFIG_DIR = `${__dirname}/../config/`

const program = require('commander')
const uploadSubmissionService = require('../src/services/uploadSubmissionService')
const logger = require('../src/common/logger')
const _ = require('lodash')
const fs = require('fs')

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

program.parse(process.argv)

uploadSubmissionService.smart(process.cwd(), program)
  .then(async (responses) => {
    const log = {}
    _.each(responses, response => {
      const resp = JSON.parse(response.text)
      const submissionId = _.get(resp, 'id', undefined)
      const challengeId = _.get(resp, 'challengeId', undefined)
      if (submissionId && challengeId) {
        if (log[challengeId]) {
          log[challengeId].push(submissionId)
        } else {
          log[challengeId] = [submissionId]
        }
      }
    })
    const logTxt = _.join(_.map(_.keys(log), key => `challenge_${key}:\t${log[key]}`), '\n')
    logger.info(`Uploaded submissions:\n${logTxt}`)
    await fs.writeFileSync('topcoder-cli.log',
      `${Date.now()}:\n${logTxt}\n\n`,
      { flag: 'a' })
    logger.info('Completed!')
    process.exit()
  })
  .catch(err => {
    logger.error(err.message)
    process.exit(1)
  })
