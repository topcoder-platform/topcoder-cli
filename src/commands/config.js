const _ = require('lodash')
const configService = require('../services/configService')
const constants = require('../../constants')

/**
 * Handles "config" commands
 * @param {Array} args Arguments
 */
async function handleSubCommand (args) {
  const options = _.last(args).opts()
  // Count the number of options which are enabled.
  const selectedOptions = _.pickBy(options, v => !_.isUndefined(v))

  if (_.size(selectedOptions) !== 1) {
    throw new Error(constants.errorMessages.invalidOptions)
  }

  const selectedOption = _.keys(selectedOptions)[0]

  switch (selectedOption) {
    case 'list':
      const contents = await configService.showConfigFile()
      console.log(contents)
      break
    case 'add':
      // key is set to the value of option `add`
      // args[0] should contain the value we want to add
      // console.log(options.add, args[0])
      if (args.length > 2) {
        throw new Error(constants.errorMessages.invalidArgs)
      }
      return configService.addToConfigFile(options.add, args[0])
    case 'unset':
      return configService.deleteFromConfigFile(options.unset)
    default:
      break
  }
}

module.exports = {
  handleSubCommand
}
