/*
 * Config File Management Service.
 */
const _ = require('lodash')
const ini = require('ini')
const homedir = require('os').homedir()
const fs = require('fs')
const errors = require('../common/errors')
const logger = require('../common/logger')

/*
 * Prints out the global config file to standard output
 */
function showConfigFileService (configPath) {
  try {
    return fs.readFileSync(configPath).toString()
  } catch (error) {
    throw errors.noGlobalConfigFileFoundError()
  }
}

function readFromConfigFileService (configPath) {
  return ini.parse(showConfigFileService(configPath))
}

function addToConfigFileService (key, value, configPath) {
  const validKeys = ['m2m.client_secret', 'm2m.client_id', 'm2m.audience']
  const keyValid = _.find(validKeys, (i) => i === key) !== undefined
  if (!keyValid) {
    throw errors.invalidKeyForConfigFileError(validKeys)
  }
  let config = ini.parse('')
  try {
    config = readFromConfigFileService(configPath)
  } catch (error) {
    // catching tcconfig file not found error here.
    logger.info('config file not found, creating file in' + homedir)
  }
  _.set(config, key, value)
  fs.writeFileSync(configPath, ini.stringify(config))
  logger.info('Successfully wrote config.')
}

module.exports = {
  showConfigFileService,
  addToConfigFileService,
  readFromConfigFileService
}
