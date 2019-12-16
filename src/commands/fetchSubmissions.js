const { fetchSubmissions } = require('../services/fetchSubmissionService')
const logger = require('../common/logger')

/**
 * Handles the "fetch-submissions" command
 * @param {commander.CommanderStatic} params CLI params passed to the program
 */
async function fetchSubmissionsHandler (params) {
  await fetchSubmissions(process.cwd(), params)
  logger.info('All Done!')
}

module.exports = fetchSubmissionsHandler
