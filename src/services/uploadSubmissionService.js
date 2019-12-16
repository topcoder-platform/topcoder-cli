/*
 * Upload user submission.
 */
const _ = require('lodash')
const path = require('path')
const AdmZip = require('adm-zip')
const glob = require('fast-glob')
const request = require('superagent')
const helper = require('../common/helper')
const logger = require('../common/logger')
const constants = require('../../constants')
const Joi = require('@hapi/joi')
const config = require('../config')()

let submissionApiClient

// Schema for validating RC Params
const schemaForRC = helper.defaultAuthSchema
  .keys({
    challengeIds: Joi.array()
      .min(1)
      .required(),
    memberId: Joi.number()
      .integer()
      .min(1)
  })
  .with('m2m', 'memberId')
  .unknown()

// Acceptable CLI params
const validCLIParams = ['challengeIds', 'memberId']

/**
 * Create a zip buffer from given folder.
 * The topcoder rc file is excluded.
 * @param {String} prefix the target directory
 * @returns {Buffer} the result zip buffer
 */
function archiveCodebase (prefix) {
  logger.info('Packaging submission...')
  const filenames = glob.sync(['**/*'], {
    cwd: prefix,
    dot: true,
    ignore: [constants.rc.name, 'node_modules'],
    onlyFiles: true
  })
  const zip = new AdmZip()
  for (const filename of filenames) {
    const pathname = path.join(prefix, filename)
    // include files in cwd and subdirectories
    const dirname = path.dirname(filename)
    if (dirname === '.') {
      zip.addLocalFile(pathname)
      continue
    }
    zip.addLocalFile(pathname, dirname)
  }
  return zip.toBuffer()
}

/**
 * Create a submission.
 * @param {String} submissionName the submission name
 * @param {Buffer} submissionData the submission data
 * @param {String} userId User ID
 * @param {String} userName User name
 * @param {String} password User password
 * @param {Array} challengeIds the challenge ids
 * @returns {Promise} the created submission
 */
async function createSubmissions (
  submissionName,
  submissionData,
  userId,
  challengeIds
) {
  for (let idx = 0; idx < challengeIds.length; idx++) {
    const challengeId = challengeIds[idx]
    try {
      logger.info(
        `[${idx + 1}/${challengeIds.length}] ` +
          `Uploading Submission: [ Challenge ID: ${challengeId} ]`
      )
      const submissionPayload = {
        memberId: userId,
        challengeId: challengeId,
        type: constants.submissionType.contestSubmission,
        submission: {
          name: submissionName,
          data: submissionData
        }
      }
      const submission = await submissionApiClient.createSubmission(
        submissionPayload
      )
      logger.info(
        `[${idx + 1}/${challengeIds.length}] ` +
          `Uploaded Submission: [ Submission ID: ${submission.body.id} | ` +
          `Challenge ID: ${submission.body.challengeId} ]`
      )
    } catch (err) {
      logger.error(
        `Error while uploading submission to challenge ID ${challengeId}. Detail - ${err.message}`
      )
    }
  }
}

/**
 * Provides functionality for uploading a submission.
 * Under current working directory, it archives all files except rc file and
 * read rc configuration from the .topcoderrc file.
 * @param {String} currDir Path to current directory
 * @param {Object} cliParams CLI params passed to the program
 * @returns {Array} Uploaded submissions
 */
async function processSubmissions (currDir, cliParams) {
  const params = cliParams.opts()
  const rcPath = path.join(currDir, constants.rc.name)
  const {
    username,
    password,
    challengeIds,
    memberId,
    m2m
  } = await helper.readFromRCFile(rcPath, params, schemaForRC, validCLIParams)

  submissionApiClient = helper.getAPIClient(username, password, m2m)

  let userId = memberId
  if (_.isNil(userId)) {
    const res = await request
      .get(`${config.TC_MEMBERS_API}/${username}`)
      .set('cache-control', constants.cacheControl.noCache)
      .set('content-type', constants.contentType.json)
    userId = _.get(res, 'body.result.content.userId')
  }

  const submissionName = `${userId}.zip`
  const submissionData = archiveCodebase(currDir)

  return createSubmissions(submissionName, submissionData, userId, challengeIds)
}

module.exports = {
  processSubmissions
}

logger.buildService(module.exports)
