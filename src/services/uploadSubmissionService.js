/*
 * Upload user submission.
 */
const helper = require('../common/helper')
const constants = require('../../constants')
const path = require('path')
const logger = require('../common/logger')

/**
 * Provide high-level functionality for upload a submission.
 * Under current working directory, it archives all files except rc file and
 * read rc configuration from the .topcoderrc file.
 *
 * @returns {undefined}
 */
async function smart (prefix) {
  const { username, password, challengeIds } = helper.readFromRCFile(path.join(prefix, constants.rc.name))
  const userId = await helper.getUserId(username)
  const submissionName = helper.submissionNameFromUserId(userId)
  const submissionData = helper.archiveCodebase(prefix)
  const token = await helper.tokenFromCredentials(username, password)
  await basic(submissionName, submissionData, token, userId, challengeIds)
}

/**
 * Provide the basic functionality for upload a submission to multiple challenges.
 *
 * @param {String} submissionName the submission name
 * @param {String} submissionData the submission data; encoded string
 * @param {String} token a JWT token for authorization
 * @param {String} userId the user id
 * @param {Array} challengeIds the array of challenge IDs
 * @returns {undefined}
 */
async function basic (submissionName, submissionData, token, userId, challengeIds) {
  for (const challengeId of challengeIds) {
    await helper.createSubmission(submissionName, submissionData, token, userId, challengeId)
  }
}

module.exports = {
  smart,
  basic
}

logger.buildService(module.exports)
