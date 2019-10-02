/*
 * Upload user submission.
 */
const helper = require('../common/helper')
const errors = require('../common/errors')
const constants = require('../../constants')
const path = require('path')
const logger = require('../common/logger')

/**
 * Provide high-level functionality for upload a submission.
 * Under current working directory, it archives all files except rc file and
 * read rc configuration from the .topcoderrc file.
 * @param {String} currDir Path to current directory
 * @param {Object} cliParams CLI params passed to the program
 * @returns {Array} Uploaded submissions
 */
async function smart (currDir, cliParams) {
  const { username, password, challengeIds } = helper.readFromRCFile(path.join(currDir, constants.rc.name), cliParams)
  const userId = await helper.getUserId(username)
  const submissionName = helper.submissionNameFromUserId(userId)
  const submissionData = helper.archiveCodebase(currDir)
  return basic(submissionName, submissionData, userId, username, password, challengeIds)
}

/**
 * Provide the basic functionality for upload a submission to multiple challenges.
 * @param {String} submissionName submission name
 * @param {String} submissionData the submission data; encoded string
 * @param {String} userId User ID
 * @param {String} userName User name
 * @param {String} password User password
 * @param {Array} challengeIds the array of challenge IDs
 * @returns {Array} uploaded submissions
 */
async function basic (submissionName, submissionData, userId, userName, password, challengeIds) {
  const submissions = []
  for (const challengeId of challengeIds) {
    try {
      const submission = await helper.createSubmission(submissionName, submissionData, userId, userName, password, challengeId)
      submissions.push(submission)
    } catch (err) {
      /* different errors will have different statuses. We can use different
      status to show meaningful output here */
      switch (err.status) {
        case 402:
          logger.error(errors.invalidAuthCredentialsErrorMsg)
          break
        default:
          logger.error(`${err.message} Error while uploading submission to challenge ID ${challengeId}.`)
          break
      }
    }
  }
  return submissions
}

module.exports = {
  smart,
  basic
}

logger.buildService(module.exports)
