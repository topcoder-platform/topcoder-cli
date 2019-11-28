/*
 * Config File Management Service.
 */
const _ = require('lodash')
const fs = require('fs')
const ini = require('ini')
const homedir = require('os').homedir()
const path = require('path')
const constants = require('../../constants')
const errors = require('../common/errors')
const logger = require('../common/logger')

const configPath = path.join(homedir, constants.config.name)

/*
 * Prints out the global config file to standard output
 */
function showConfigFileService () {
  try {
    return fs.readFileSync(configPath).toString()
  } catch (error) {
    throw errors.noGlobalConfigFileFoundError()
  }
}

function readFromConfigFileService () {
  return ini.parse(showConfigFileService())
}

function addToConfigFileService (key, value) {
  // Allowed keys
  const validKeys = ['m2m.client_id', 'm2m.client_secret', 'username', 'password']
  const isKeyValid = _.find(validKeys, (i) => i === key) !== undefined

  if (!isKeyValid) {
    throw errors.customError(`Invalid key value. try one of: ${validKeys.join(', ')}`)
  }

  let config = ini.parse('')
  try {
    config = readFromConfigFileService()
  } catch (error) {
    // catching tcconfig file not found error here.
    logger.info('Topcoder config file not found, creating file in' + homedir)
  }
  _.set(config, key, value)
  fs.writeFileSync(configPath, ini.stringify(config))
  logger.info(`${key} added to the config file.`)
}

function deleteFromConfigFileService (keyToBeDeleted) {
  const config = readFromConfigFileService()
  let isDeleted = false

  Object.keys(config).forEach((key) => {
    if (key === keyToBeDeleted) {
      delete config[key]
      isDeleted = true
    }
  })

  if (isDeleted) {
    fs.writeFileSync(configPath, ini.stringify(config))
    logger.info(`${keyToBeDeleted} is removed from the config file successfully.`)
  } else {
    throw errors.customError(`${keyToBeDeleted} is not found in the config fle.`)
  }
}

module.exports = {
  showConfigFileService,
  addToConfigFileService,
  deleteFromConfigFileService,
  readFromConfigFileService
}
