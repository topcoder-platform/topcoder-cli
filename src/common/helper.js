const _ = require('lodash')
const Joi = require('@hapi/joi')
const fs = require('fs-extra')
const submissionApi = require('@topcoder-platform/topcoder-submission-api-wrapper')
const logger = require('./logger')
const configService = require('../services/configService')

const defaultAuthSchema = Joi.object({
  username: Joi.string(),
  password: Joi.string(),
  m2m: Joi.object({
    client_id: Joi.string().required(),
    client_secret: Joi.string().required()
  })
})
  .or('username', 'm2m')
  .xor('username', 'm2m')
  .with('username', 'password')
  .with('password', 'username')

/**
 * Read configuration from given topcoder rc file.
 * @param {String} filename the name of the rc file
 * @param {Object} cliParams CLI params passed to the program
 * @returns {Object} the rc object
 */
async function readFromRCFile (filename, cliParams, schema, validCLIParams) {
  function removeEmptyValues (object) {
    return _.reduce(
      object,
      (acc, val, key) => {
        if (_.isNil(val)) {
          return acc
        }
        if (_.isObject(val)) {
          const cleansedVal = removeEmptyValues(val)
          if (_.size(cleansedVal) > 0) {
            acc[key] = val
          }
          return acc
        }
        acc[key] = val
        return acc
      },
      {}
    )
  }
  let rcObject = {}
  // Read if Topcoder RC file exists
  const fileExists = await fs.exists(filename)
  if (fileExists) {
    logger.info('Reading from topcoder rc file...')
    rcObject = await fs.readJSON(filename)
  }

  if (!_.isEmpty(_.get(cliParams, 'challengeIds'))) {
    cliParams.challengeIds = cliParams.challengeIds.split(',')
  }

  // Override values from RC file with CLI params
  let mergedCred = removeEmptyValues(
    _.merge(
      rcObject,
      _.pick(cliParams, [...validCLIParams, 'username', 'password'])
    )
  )

  // Read from Global config only if there are no overrides from RC file or CLI
  if (!(_.has(mergedCred, 'username') || _.has(mergedCred, 'm2m.client_id'))) {
    const globalConfig = await configService.readFromConfigFile()
    if ('username' in globalConfig) {
      mergedCred = _.merge(
        mergedCred,
        _.pick(globalConfig, ['username', 'password'])
      )
    } else if ('m2m' in globalConfig) {
      mergedCred = _.merge(mergedCred, _.pick(globalConfig, ['m2m']))
    }
  }
  try {
    return Joi.attempt(mergedCred, schema)
  } catch (err) {
    throw new Error(`Validation failed: ${err.message}`)
  }
}

function getAPIClient (userName, password, m2m) {
  const config = require('../config')()
  let clientConfig
  if (userName && password) {
    clientConfig = _.pick(config, [
      'TC_AUTHN_URL',
      'TC_AUTHZ_URL',
      'TC_CLIENT_ID',
      'TC_CLIENT_V2CONNECTION',
      'SUBMISSION_API_URL'
    ])
    clientConfig.USERNAME = userName
    clientConfig.PASSWORD = password
  } else {
    clientConfig = _.pick(config, [
      'AUTH0_URL',
      'AUTH0_AUDIENCE',
      'TOKEN_CACHE_TIME',
      'SUBMISSION_API_URL',
      'AUTH0_PROXY_SERVER_URL'
    ])
    clientConfig.AUTH0_CLIENT_ID = m2m.client_id
    clientConfig.AUTH0_CLIENT_SECRET = m2m.client_secret
  }
  const submissionApiClient = submissionApi(clientConfig)
  return submissionApiClient
}

module.exports = {
  readFromRCFile,
  getAPIClient,
  defaultAuthSchema
}
