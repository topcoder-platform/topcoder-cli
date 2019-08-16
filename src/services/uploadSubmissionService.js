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
 * @returns {Array} Uploaded submissions
 */
async function smart (prefix) {
  const { username, password, challengeIds } = helper.readFromRCFile(path.join(prefix, constants.rc.name))
  const userId = await helper.getUserId(username)
  const submissionName = helper.submissionNameFromUserId(userId)
  const submissionData = helper.archiveCodebase(prefix)
  return await basic(submissionName, submissionData, userId, username, password, challengeIds)
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
    const submission = await helper.createSubmission(submissionName, submissionData, userId, userName, password, challengeId)
    submissions.push(submission)
  }
  return submissions
}

module.exports = {
  smart,
  basic
}

logger.buildService(module.exports)
