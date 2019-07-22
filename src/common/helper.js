const _ = require('lodash')
const Joi = require('joi')
const fs = require('fs')
const config = require('config')
const request = require('superagent')
const AdmZip = require('adm-zip')
const glob = require('fast-glob')
const path = require('path')
const ProgressBar = require('progress')
const constants = require('../../constants')
const logger = require('./logger')

const schemaForRC = Joi.object({
  challengeIds: Joi.array().min(1).required(),
  username: Joi.string().required(),
  password: Joi.string().required()
})

/**
 * Read configuration from given topcoder rc file.
 *
 * @param {String} filename the name of the rc file
 * @returns {Object} the rc object
 */
function readFromRCFile (filename) {
  logger.info('Reading from topcoder rc file...')
  const rcObject = JSON.parse(fs.readFileSync(filename).toString())
  return validateRCObject(rcObject)
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
 * @param {String} token a JWT token for authorization
 * @param {String} userId the user id
 * @param {String} challengeId the challenge id
 * @returns {Promise} the created submission
 */
async function createSubmission (submissionName, submissionData, token, userId, challengeId) {
  logger.info(`Uploading submission on challenge ${challengeId}...`)
  let bar
  return request
    .post(config.SUBMISSION_API_URL)
    .set('Authorization', `Bearer ${token}`)
    .field({
      type: constants.submissionType.contestSubmission,
      memberId: userId,
      challengeId: challengeId
    })
    .attach('submission', submissionData, submissionName)
    .on('progress', event => {
      if (!bar) {
        bar = new ProgressBar(`  uploading [:bar] :percent [Total: ${_humanFileSize(event.total)}]`, {
          complete: '=',
          incomplete: ' ',
          width: 20,
          total: event.total
        })
      }
      bar.tick(event.loaded)
      if (event.loaded === event.total) {
        setInterval(() => {
          process.stdout.write('.')
        }, 1000)
      }
    })
}

/**
 * Convert byte to human-readable size.
 *
 * @param {Number} size the size in byte
 * @returns {String} the size human-readable
 */
function _humanFileSize (size) {
  const i = Math.floor(Math.log(size) / Math.log(1024))
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
}

/**
 * Create token from credentials.
 *
 * @param {String} username the TC login username
 * @param {String} password the TC login password
 * @returns {String} JWT token that can be used in fetching TC resources.
 */
async function tokenFromCredentials (username, password) {
  logger.info('Fetching JWT token from TC Auth service...')
  const v2Token = await request
    .post(config.TC_AUTHN_URL)
    .set('cache-control', constants.cacheControl.noCache)
    .set('content-type', constants.contentType.json)
    .send({
      username: username,
      password: password,
      client_id: config.TC_CLIENT_ID,
      sso: constants.sso,
      scope: constants.scope,
      response_type: constants.responseType,
      connection: config.TC_CLIENT_V2CONNECTION,
      grant_type: constants.grantType,
      device: constants.device
    })
  const res = await _tokenV3FromV2(v2Token.body)
  return _.get(res, 'body.result.content.token')
}

/**
 * Fetch v3 token.
 *
 * @param {Object} v2Token the v2 token
 * @returns {Object} response that contains v3 token
 */
async function _tokenV3FromV2 (v2Token) {
  return request
    .post(config.TC_AUTHZ_URL)
    .set('cache-control', constants.cacheControl.noCache)
    .set('authorization', `Bearer ${v2Token['id_token']}`)
    .set('content-type', constants.contentType.json)
    .send({
      param: {
        externalToken: v2Token['id_token'],
        refreshToken: _.get(v2Token, 'refresh_token', '')
      }
    })
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
  tokenFromCredentials,
  submissionNameFromUserId,
  getUserId
}
