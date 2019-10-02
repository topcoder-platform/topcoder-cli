const uploadSubmissionService = require('../services/uploadSubmissionService')
const errors = require('../common/errors')
const logger = require('../common/logger')
const _ = require('lodash')
const fs = require('fs')

/**
 * Provide the basic command for uploading a submission to multiple challenges.
 * @param {commander.CommanderStatic} params CLI params passed to the program
 */
const submit = (params) => {
  uploadSubmissionService.smart(process.cwd(), params)
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
      logger.info(`Uploaded submissions:\n${logTxt || 'No submissions uploaded.'}`)
      await fs.writeFileSync('topcoder-cli.log',
        `${Date.now()}:\n${logTxt}\n\n`,
        { flag: 'a' })
      logger.info('Completed!')
      process.exit()
    })
    .catch(err => {
      switch (err.code) {
        case 'ENOTFOUND':
          logger.error(errors.connectionErrorMsg)
          break
        default:
          logger.error(err.message)
          break
      }
      process.exit(1)
    })
}

module.exports = submit
