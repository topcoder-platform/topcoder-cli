const { fetchArtifacts } = require('../services/fetchArtifactsService')
const logger = require('../common/logger')

/**
 * Handles the "fetch-artifacts" command
 * @param {commander.CommanderStatic} params CLI params passed to the program
 */
async function fetchArtifactsHandler (params) {
  await fetchArtifacts(process.cwd(), params)
  logger.info('All Done!')
}

module.exports = fetchArtifactsHandler
