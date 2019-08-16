#!/usr/bin/env node
process.env.NODE_CONFIG_DIR = `${__dirname}/../config/`

const uploadSubmissionService = require('../src/services/uploadSubmissionService')
const logger = require('../src/common/logger')
const _ = require('lodash')
const fs = require('fs')

uploadSubmissionService.smart(process.cwd())
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
