const _ = require('lodash')
const path = require('path')
const Joi = require('@hapi/joi')
const fs = require('fs-extra')
const contentDisposition = require('content-disposition')
const helper = require('../common/helper')
const constants = require('../../constants')
const logger = require('../common/logger')

let submissionApiClient

// Schema for validating RC Params
const schemaForRC = helper.defaultAuthSchema
  .keys({
    submissionId: Joi.string(),
    legacySubmissionId: Joi.string()
  })
  .xor('submissionId', 'legacySubmissionId')
  .unknown()

// Acceptable CLI params
const validCLIParams = ['submissionId', 'legacySubmissionId']

/**
 * Download the artifacts to the savePath directory sequentially.
 * @param {Array} artifacts List of submission objects
 * @param {String} savePath Directory in which to save
 */
async function downloadArtifacts (submissionId, artifacts, savePath) {
  // Loop through the artifacts
  for (let idx = 0; idx < artifacts.length; idx += 1) {
    const artifactId = artifacts[idx]
    // Log the download
    logger.info(
      `[${idx + 1}/${artifacts.length}] ` +
        `Downloading Artifact: [ Artifact ID: ${artifactId} | ` +
        `Submission ID: ${submissionId} ]`
    )
    try {
      // Download the artifact
      let req = await submissionApiClient.downloadArtifact(
        submissionId,
        artifactId,
        null,
        true
      )
      // Get the temporary path
      const temporaryFilePath = path.join(savePath, `artifact-${artifactId}.tcdownload`)
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
        `[${idx + 1}/${artifacts.length}] ` +
          `File saved: [ Location: ${filePath} ]`
      )
    } catch (err) {
      logger.error(`Couldn't download artifact with id: ${artifactId}.`)
      logger.error(err.message)
    }
  }
}

/**
 * Fetches artifacts for the particular submissionId and saves them in
 * the `submission-${submissionId}-artifacts` directory.
 * directory`.
 * @param {String} currDir The current directory
 * @param {Array} cliParams CLI parameters
 */
async function fetchArtifacts (currDir, cliParams) {
  // Define constants
  const params = cliParams.opts()
  const rcPath = path.join(currDir, constants.rc.name)

  // Get user-variables values.
  let {
    username,
    password,
    m2m,
    submissionId,
    legacySubmissionId
  } = await helper.readFromRCFile(rcPath, params, schemaForRC, validCLIParams)

  // Set up the API client
  submissionApiClient = helper.getAPIClient(username, password, m2m)

  // If the legacy submission Id is provided, get the v5 submission Id
  if (legacySubmissionId) {
    const submission = await submissionApiClient.searchSubmissions({
      legacySubmissionId
    })
    submissionId = submission.body[0].id
  }

  // Calculate save path
  const savePath = path.join(currDir, `submission-${submissionId}-artifacts`)

  //  Get the list of the artifacts
  logger.info(`Listing artifacts for submission ID: ${submissionId}.`)
  let artifacts = await submissionApiClient.listArtifacts(submissionId)
  artifacts = _.get(artifacts, 'body.artifacts', [])

  // Check if no artifacts exist
  if (artifacts.length === 0) {
    logger.info(`No artifact exists for submission with ID: ${submissionId}.`)
    return
  }

  // Make the directory in which files will be saved.
  await /* TODO: JSFIX could not patch the breaking change:
  Creating a directory with fs-extra no longer returns the path 
  Suggested fix: The returned promise no longer includes the path of the new directory */
  fs.mkdirp(savePath)

  // Download the artifacts
  return downloadArtifacts(submissionId, artifacts, savePath)
}

module.exports = {
  fetchArtifacts
}

logger.buildService(module.exports)
