const _ = require('lodash')
const path = require('path')
const Joi = require('@hapi/joi')
const moment = require('moment')
const fs = require('fs-extra')
const contentDisposition = require('content-disposition')
const helper = require('../common/helper')
const constants = require('../../constants')
const logger = require('../common/logger')

let submissionApiClient

// Schema for validating RC Params
const schemaForRC = helper.defaultAuthSchema
  .keys({
    challengeId: Joi.string().required(),
    memberId: Joi.number().integer(),
    submissionId: Joi.string(),
    latest: Joi.boolean()
  })
  .without('submissionId', ['memberId', 'latest'])
  .without('memberId', 'submissionId')
  .without('latest', 'submissionId')
  .unknown()

// Acceptable CLI params
const validCLIParams = ['challengeId', 'memberId', 'submissionId', 'latest']

/**
 * Download the submissions to the savePath directory sequentially.s
 * @param {Array} submissions List of submission objects
 * @param {String} savePath Directory in which to save
 */
async function downloadSubmissions (submissions, savePath) {
  // Loop through the artifacts
  for (let idx = 0; idx < submissions.length; idx += 1) {
    const submission = submissions[idx]
    // Log the download
    logger.info(
      `[${idx + 1}/${submissions.length}] ` +
        `Downloading Submission: [ Submission ID: ${submission.id} | ` +
        `Challenge ID: ${submission.challengeId} ]`
    )
    try {
      // Download the submission
      let req = await submissionApiClient.downloadSubmission(submission.id, null, true)
      // Get the temporary path
      const temporaryFilePath = path.join(savePath, `submission-${submission.id}.tcdownload`)
      // Save the file
      const fStream = fs.createWriteStream(temporaryFilePath)
      const writeStream = req.pipe(fStream)
      // Wait for write to complete
      await new Promise((resolve, reject) => {
        req.on('response', (_req) => {
          req = _req
        })
        writeStream.on('finish', resolve)
        writeStream.on('error', reject)
      })
      // Get file name from headers
      const disposition = _.get(req, 'headers.content-disposition')
      const fileName = contentDisposition.parse(disposition).parameters.filename
      // Get the final file path
      const filePath = path.join(savePath, fileName)
      // Save the file
      await fs.move(temporaryFilePath, filePath)
      // Log the result
      logger.info(
        `[${idx + 1}/${submissions.length}] ` +
          `File saved: [ Location: ${filePath} ]`
      )
    } catch (err) {
      logger.error(`Couldn't download submission with id: ${submission.id}.`)
      logger.error(err.message)
    }
  }
}

/**
 * Fetches submissions for the particular challengeId, filters according to the
 * provided CLI parameters, and saves in the `${challengeId}-submissions
 * directory`.
 * @param {String} currDir The current directory
 * @param {Array} cliParams CLI parameters
 */
async function fetchSubmissions (currDir, cliParams) {
  const params = cliParams.opts()
  const rcPath = path.join(currDir, constants.rc.name)
  // Get user-variables values.
  const {
    username,
    password,
    m2m,
    challengeId,
    memberId,
    submissionId,
    latest
  } = await helper.readFromRCFile(rcPath, params, schemaForRC, validCLIParams)

  // Set up the API client
  submissionApiClient = helper.getAPIClient(username, password, m2m)

  // The directory in which files will be saved
  const savePath = path.join(currDir, `${challengeId}-submissions`)

  // If submissionId is provided
  if (submissionId) {
    //  Get the information of the submission, if submission ID is specified.
    logger.info(`Getting details about submission with ID: ${submissionId}.`)
    const { body: submission } = await submissionApiClient.getSubmission(
      submissionId
    )
    // Check if challengeId matches
    const submissionChallengeId = `${_.get(submission, 'challengeId')}`
    if (challengeId !== submissionChallengeId) {
      throw new Error("Submission doesn't belong to specified challenge.")
    }
    // Begin download
    return downloadSubmissions([submission], savePath)
  }

  // Get info of all the submissions.
  let total = Infinity
  let submissions = []
  for (let page = 1; total > page * 100; page += 1) {
    // Define default query
    const query = {
      challengeId: challengeId,
      perPage: 100,
      page
    }
    // If there's a memberId specified, filter by memberId.
    if (memberId) {
      query.memberId = memberId
    }
    // Get a list of submissions
    const nextSubmissions = await submissionApiClient.searchSubmissions(query)
    // Save them
    submissions.push(...nextSubmissions.body)
    // Check if there's more submissions
    total = Number(_.get(nextSubmissions, 'headers.x-total', 0))
  }

  // If latest is specified, remove all but the latest submission by each user.
  if (latest) {
    const filteredSubmissions = {}
    // Loop through all submissions
    for (const submission of submissions) {
      // Convert created date of submission to a moment
      submission.created = moment(submission.created)
      // If there's no previous submission by same memberId, save and continue.
      if (!_.has(filteredSubmissions, submission.memberId)) {
        _.set(filteredSubmissions, submission.memberId, submission)
        continue
      }
      // There's been a submission by the same member before.
      // Compare their created moment and save the newer one.
      const prevSubmission = filteredSubmissions[submission.memberId]
      if (prevSubmission.created.isBefore(submission.created)) {
        _.set(filteredSubmissions, submission.memberId, submission)
      }
    }
    submissions = _.values(filteredSubmissions)
  }

  // Check if no artifacts exist
  if (submissions.length === 0) {
    logger.info(
      `No submissions exists with specified filters for challenge with ID: ${challengeId}.`
    )
    return
  }

  // Make the directory in which files will be saved.
  await fs.mkdirp(savePath)

  // Download the submissions.
  return downloadSubmissions(submissions, savePath)
}

module.exports = {
  fetchSubmissions
}

logger.buildService(module.exports)
