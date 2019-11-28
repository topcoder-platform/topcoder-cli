const _ = require('lodash')
const Joi = require('joi')
const fs = require('fs')
const request = require('superagent')
const AdmZip = require('adm-zip')
const glob = require('fast-glob')
const path = require('path')
const constants = require('../../constants')
const logger = require('./logger')
const errors = require('./errors')
const configService = require('../services/configService')
const submissionApi = require('@topcoder-platform/topcoder-submission-api-wrapper')

const schemaForRC = Joi.object({
  challengeIds: Joi.array().min(1).required(),
  username: Joi.string(),
  password: Joi.string(),
  memberId: Joi.number().integer().min(1),
  m2m: Joi.object({
    client_id: Joi.string().required(),
    client_secret: Joi.string().required()
  })
}).or('username', 'm2m')
  .xor('username', 'm2m')
  .with('username', 'password')
  .with('password', 'username')
  .with('m2m', 'memberId')

/**
 * Read configuration from given topcoder rc file.
 *
 * @param {String} filename the name of the rc file
 * @param {Object} cliParams CLI params passed to the program
 * @returns {Object} the rc object
 */
function readFromRCFile (filename, cliParams) {
  let rcObject = {}
  // Read if Topcoder RC file exists
  if (fs.existsSync(filename)) {
    logger.info('Reading from topcoder rc file...')
    rcObject = JSON.parse(fs.readFileSync(filename).toString())
  }

  if (!_.isEmpty(_.get(cliParams, 'challengeIds'))) {
    cliParams.challengeIds = cliParams.challengeIds.split(',')
  }

  // Override values from RC file with CLI params
  let mergedCred = _.merge(rcObject, _.pick(cliParams, ['username', 'password', 'challengeIds', 'memberId']))

  // Read from Global config only if there are no overrides from RC file or CLI
  if (!(Object.keys(mergedCred).includes('username') || Object.keys(mergedCred).includes('m2m.client_id'))) {
    const globalConfig = configService.readFromConfigFileService()
    if ('username' in globalConfig) {
      mergedCred = _.merge(mergedCred, _.pick(globalConfig, ['username', 'password']))
    } else if ('m2m' in globalConfig) {
      mergedCred = _.merge(mergedCred, _.pick(globalConfig, ['m2m']))
    }
  }
  return validateRCObject(mergedCred)
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
    throw errors.customError(`RC validation failed: ${err.message}`)
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
  const config = require('../config')()
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
  const config = require('../config')()
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
