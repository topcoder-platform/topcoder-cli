const configService = require('../services/configService')
const errors = require('../common/errors')
const constants = require('../../constants')

function handleSubCommand (args) {
  const options = args[args.length - 1].opts()
  // Count the number of options which are enabled.
  const numOptions = Object.values(options).reduce((t, obj) => obj !== undefined ? t + 1 : t, 0)

  if (numOptions > 1 || numOptions === 0) {
    throw errors.customError(constants.errorMessages.invalidOptions)
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
      console.log(configService.showConfigFileService())
      break
    case 'add':
      // key is set to the value of option `add`
      // args[0] should contain the value we want to add
      // console.log(options.add, args[0])
      if (args.length > 2) {
        throw errors.customError(constants.errorMessages.invalidArgs)
      }
      return configService.addToConfigFileService(options.add, args[0])
    case 'unset':
      return configService.deleteFromConfigFileService(options.unset)
    default :
      break
  }
}

module.exports = {
  handleSubCommand
}
