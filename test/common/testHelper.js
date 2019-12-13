/*
 * Helper functions for test.
 */
const AdmZip = require('adm-zip')
const _ = require('lodash')
const fs = require('fs-extra')
const ini = require('ini')
const { ObjectWritableMock } = require('stream-mock')

function listZipEntries (buffer) {
  const zip = new AdmZip(buffer)
  return zip.getEntries()
}

/**
 * Build command line arguments.
 *
 * @param {String} subName the sub-command name
 * @param {Object} options the object representing arguments
 * @returns {Array} the arguments
 */
function buildArgs (subName, options) {
  const args = ['node', 'topcoder-cli.js']
  if (!_.isUndefined(subName)) {
    args.push(subName)
  }
  _.forEach(options, (value, key) => {
    if (_.isArray(value)) {
      args.push(`--${key}`, ...value)
      return
    }
    if (_.isBoolean(value) && value) {
      args.push(`--${key}`)
      return
    }
    args.push(`--${key}`, value)
  })
  return args
}

/**
 * Mock a function of a module.
 *
 * @param {Object} module the module
 * @param {String} functionName the function name
 * @param {Function} func the mocked function
 * @returns {Object} an object contains restore method
 */
function mockFunction (module, functionName, func) {
  const originalFunction = module[functionName]
  module[functionName] = func
  return {
    restore: () => { module[functionName] = originalFunction }
  }
}

/**
 * Mock RC config so that no actual RC files need to be provided during test.
 *
 * @param {Object} config the configs
 * @returns {Object} an object contains restore method
 */
function mockRCConfig (config) {
  const ensureRCFileExists = mockFunction(
    fs, 'exists', () => true
  )
  const returnRCConfig = mockFunction(
    fs, 'readJSON', () => (config)
  )
  return {
    restore: () => {
      ensureRCFileExists.restore()
      returnRCConfig.restore()
    }
  }
}

/**
 * Mock global configuration.
 *
 * @param {Object} config the configs
 * @returns {Object} an object contains restore method
 */
function mockGlobalConfig (config) {
  return mockFunction(
    fs, 'readFile', () => ini.stringify(config)
  )
}

/**
 * mock functions related download process
 * so that no actual downloading happened during the tests.
 *
 * @param {Array} downloadInfo an array used to store filenames and data
 * @returns {Object} an object contains restore method
 */
function mockDownload (downloadInfo) {
  let data
  const mockWriteStream = mockFunction(fs, 'createWriteStream', () => {
    const writer = new ObjectWritableMock()
    writer.on('finish', () => {
      data = writer.data
    })
    return writer
  })
  const mockMoveFile = mockFunction(fs, 'move', (source, target) => {
    downloadInfo.push({ filename: target, data })
  })
  return {
    restore: () => {
      mockWriteStream.restore()
      mockMoveFile.restore()
    }
  }
}

/**
 * Low-budget multipart parser.
 *
 * @param {Object} text the raw multipart string
 * @returns {Object} parsed object
 */
function parseMultipart (text) {
  const textTrimed = text.trim()
  const boundary = textTrimed.split('\r\n')[0]
  const blocks = _.map(
    textTrimed.split(boundary).slice(1, -1),
    text => text.trim()
  )
  const data = {}
  for (const block of blocks) {
    const [headerPart, body] = block.split('\r\n\r\n')
    const pairs = _.map(
      headerPart.match(/(?<key>\S+)="(?<value>\S+)"/g),
      text => text.split('=')
    ).reduce((object, item) => Object.assign(object, { [item[0]]: item[1].match(/"(?<quoted>\S+)"/).groups.quoted }), {})
    data[pairs.name] = {
      headers: _.omit(pairs, ['name']),
      body
    }
  }
  return data
}

module.exports = {
  listZipEntries,
  buildArgs,
  mockFunction,
  mockRCConfig,
  mockGlobalConfig,
  mockDownload,
  parseMultipart
}
