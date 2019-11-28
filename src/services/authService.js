const _ = require('lodash')

const path = require('path')
const constants = require('../../constants')
const helper = require('../common/helper')
const logger = require('../common/logger')
const configCommand = require('../commands/config')
const configService = require('./configService')
const tcCoreAPi = require('tc-core-library-js')

async function m2mAuth (cliParams) {
  const config = require('../config')()
  const cwd = process.cwd()
  const rcObj = helper.readFromRCFile(path.join(cwd, constants.rc.name), cliParams)
  const configObj = configService.readFromConfigFileService(configCommand.configPath)
  const finalConfig = _.merge(configObj, rcObj)

  const m2mApi = tcCoreAPi.auth.m2m(_.merge(config, finalConfig.m2m))
  const clientId = _.get(finalConfig, 'm2m.client_id')
  const clientSecret = _.get(finalConfig, 'm2m.client_secret')
  try {
    const token = await m2mApi.getMachineToken(clientId, clientSecret)
    return token
  } catch (error) {
    logger.error('Error while doing m2m Auth. Check your client_secret and client_id')
  }
}

module.exports = {
  m2mAuth
}
