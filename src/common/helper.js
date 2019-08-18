const _ = require('lodash')
const Joi = require('joi')
const fs = require('fs')
const config = require('config')
const request = require('superagent')
const AdmZip = require('adm-zip')
const glob = require('fast-glob')
const path = require('path')
const constants = require('../../constants')
const logger = require('./logger')
const submissionApi = require('@topcoder-platform/topcoder-submission-api-wrapper')

const schemaForRC = Joi.object({
  challengeIds: Joi.array().min(1).required(),
  username: Joi.string().required(),
  password: Joi.string().required()
})

/**
 * Read configuration from given topcoder rc file.
 *
 * @param {String} filename the name of the rc file
 * @param {Object} cliParams CLI params passed to the program
 * @returns {Object} the rc object
 */
function readFromRCFile (filename, cliParams) {
  logger.info('Reading from topcoder rc file...')
  const rcObject = JSON.parse(fs.readFileSync(filename).toString())
  if (_.get(cliParams.challengeIds)) {
    cliParams.challengeIds = cliParams.challengeIds.split(',')
  }
  // Override values from RC file with CLI params
  return validateRCObject(_.merge(rcObject, _.pick(cliParams, ['username', 'password', 'challengeIds'])))
}

/**
 * Validate rc configuration.
 *
 * @param {Object} rcObject the rc object
 * @returns {Object} the rc object
 */
function validateRCObject (rcObject) {
  try {
    Joi.attempt(rcObject, schemaForRC)
  } catch (err) {
    logger.error(err)
    throw Error(`RC validation failed: ${err.message}`)
  }
  return rcObject
}

/**
 * Create a zip buffer from given folder.
 * The topcoder rc file is excluded.
 *
 * @param {String} prefix the target directory
 * @returns {Buffer} the result zip buffer
 */
function archiveCodebase (prefix) {
  logger.info('Packaging submission...')
  const filenames = glob.sync(['**/*'], {
    cwd: prefix,
    dot: true,
    ignore: [
      constants.rc.name
    ],
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
  const buffer = zip.toBuffer()
  return buffer
}

/**
 * Create a submission.
 *
 * @param {String} submissionName the submission name
 * @param {Buffer} submissionData the submission data
 * @param {String} userId User ID
 * @param {String} userName User name
 * @param {String} password User password
 * @param {String} challengeId the challenge id
 * @returns {Promise} the created submission
 */
async function createSubmission (submissionName, submissionData, userId, userName, password, challengeId) {
  logger.info(`Uploading submission on challenge ${challengeId}...`)
  const clientConfig = _.pick(config,
    ['TC_AUTHN_URL', 'TC_AUTHZ_URL', 'TC_CLIENT_ID',
      'TC_CLIENT_V2CONNECTION', 'SUBMISSION_API_URL'])
  clientConfig['USERNAME'] = userName
  clientConfig['PASSWORD'] = password
  const submissionApiClient = submissionApi(clientConfig)

  const submission = {
    memberId: userId,
    challengeId: challengeId,
    type: constants.submissionType.contestSubmission,
    submission: {
      name: submissionName,
      data: submissionData
    }
  }
  return submissionApiClient.createSubmission(submission)
}

/**
 * Get user ID
 *
 * @param {String} username the username
 * @returns {String} the user's ID
 */
async function getUserId (username) {
  const res = await request
    .get(`${config.TC_MEMBERS_API}/${username}`)
    .set('cache-control', constants.cacheControl.noCache)
    .set('content-type', constants.contentType.json)
  return _.get(res, 'body.result.content.userId')
}

/**
 * Make a unique filename from user ID.
 *
 * @param {String} userId the user ID
 * @returns {String} result submission name
 */
function submissionNameFromUserId (userId) {
  return `${userId}.zip`
}

module.exports = {
  readFromRCFile,
  validateRCObject,
  archiveCodebase,
  createSubmission,
  submissionNameFromUserId,
  getUserId
}
