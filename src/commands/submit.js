const { processSubmissions } = require('../services/uploadSubmissionService')
const logger = require('../common/logger')

/**
 * Handles the "submit" command
 * @param {commander.CommanderStatic} params CLI params passed to the program
 */
async function submit (params) {
  await processSubmissions(process.cwd(), params)
  logger.info('All Done!')
}

module.exports = submit
