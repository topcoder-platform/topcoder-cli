/*
 * Config File Management Service.
 */
const _ = require('lodash')
const fs = require('fs-extra')
const ini = require('ini')
const homedir = require('os').homedir()
const path = require('path')
const constants = require('../../constants')
const logger = require('../common/logger')

const configPath = path.join(homedir, constants.config.name)

/*
 * Prints out the global config file to standard output
 */
async function showConfigFile () {
  try {
    const contents = await fs.readFile(configPath)
    return contents.toString()
  } catch (error) {
    throw new Error('No global config file found.')
  }
}

/**
 * Read the global config files
 */
async function readFromConfigFile () {
  return ini.parse(await showConfigFile())
}

/**
 * Add a property to the global config file
 * @param {String} key Property key
 * @param {String} value Property value
 */
async function addToConfigFile (key, value) {
  // Allowed keys
  const validKeys = [
    'm2m.client_id',
    'm2m.client_secret',
    'username',
    'password'
  ]
  const isKeyValid = _.indexOf(validKeys, key) !== -1

  if (!isKeyValid) {
    throw new Error(`Invalid key value. try one of: ${validKeys.join(', ')}`)
  }

  let config = ini.parse('')
  try {
    config = await readFromConfigFile()
  } catch (error) {
    // catching .tcconfig file not found error here.
    logger.info('Topcoder config file not found, creating file in' + homedir)
  }
  _.set(config, key, value)
  await fs.writeFile(configPath, ini.stringify(config))
  logger.info(`${key} added to the config file.`)
}

/**
 * Deletes a property from the global config file
 * @param {String} keyToBeDeleted Property key (to be deleted)
 */
async function deleteFromConfigFile (keyToBeDeleted) {
  const config = await readFromConfigFile()
  if (_.isUndefined(_.get(config, keyToBeDeleted))) {
    throw new Error(`${keyToBeDeleted} is not found in the config file.`)
  }
  _.unset(config, keyToBeDeleted)
  await fs.writeFile(configPath, ini.stringify(config))
  logger.info(
    `${keyToBeDeleted} is removed from the config file successfully.`
  )
}

module.exports = {
  showConfigFile,
  addToConfigFile,
  deleteFromConfigFile,
  readFromConfigFile
}
