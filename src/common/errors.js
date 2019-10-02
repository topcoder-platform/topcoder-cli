const connectionErrorMsg = 'Error while connecting to topcoder. Please check your connection and try again.'
const invalidAuthCredentialsErrorMsg = 'Invalid Authentication credentials. Please check your credentials and try again.'

function RCValidationError (err) {
  return new Error(`RC validation failed: ${err.message}`)
}

function noGlobalConfigFileFoundError () {
  return new Error('no global config file found')
}

function invalidNoOfOptionsUsedError () {
  return new Error('Invalid group of options. Try with only one option.')
}

function invalidNoOfArgsPassedError () {
  return new Error('Invalid number of values passed.')
}

function invalidKeyForConfigFileError (validKeys) {
  return new Error(`Invalid key value. try one of: ${validKeys.join(', ')}`)
}

module.exports = {
  connectionErrorMsg,
  invalidAuthCredentialsErrorMsg,
  RCValidationError,
  noGlobalConfigFileFoundError,
  invalidNoOfOptionsUsedError,
  invalidKeyForConfigFileError,
  invalidNoOfArgsPassedError
}
