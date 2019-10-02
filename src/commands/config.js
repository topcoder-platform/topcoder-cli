const homedir = require('os').homedir()
const path = require('path')
const constants = require('../../constants')
const configService = require('../services/configService')
const errors = require('../common/errors')

const configPath = path.join(homedir, constants.config.name)

function handleSubCommand (args) {
  const options = args[args.length - 1].opts()
  // Count the number of options which are enabled.
  const numOptions = Object.values(options).reduce((t, obj) => obj !== undefined ? t + 1 : t, 0)

  if (numOptions > 1) {
    throw errors.invalidNoOfOptionsUsedError()
  }

  const allOptions = Object.keys(options)
  let selectedOption

  // get the selected option
  for (let i = 0; i < allOptions.length; i++) {
    if (options[allOptions[i]]) {
      selectedOption = allOptions[i]
      break
    }
  }

  switch (selectedOption) {
    case 'list':
      showConfigFile()
      break
    case 'add':
      // key is set to the value of option `add`
      // args[0] should contain the value we want to add
      // console.log(options.add, args[0])
      if (args.length > 2) {
        throw errors.invalidNoOfArgsPassedError()
      }
      addToConfigFile(options.add, args[0])
      break
    default :

      break
  }
}

function showConfigFile () {
  console.log(configService.showConfigFileService(configPath))
}

function addToConfigFile (key, value) {
  return configService.addToConfigFileService(key, value, configPath)
}

module.exports = {
  handleSubCommand,
  showConfigFile,
  addToConfigFile,
  configPath
}
