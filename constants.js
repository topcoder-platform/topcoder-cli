/*
 * Application constants
 */

module.exports = {
  rc: {
    name: '.topcoderrc'
  },
  config: {
    name: '.tcconfig'
  },
  submissionType: {
    contestSubmission: 'Contest Submission'
  },
  cacheControl: {
    noCache: 'no-cache'
  },
  contentType: {
    json: 'application/json',
    zip: 'application/zip'
  },
  sso: false,
  scope: 'openid profile offline_access',
  responseType: 'token',
  grantType: 'password',
  device: 'Browser',
  errorMessages: {
    connectionError: 'Error while connecting to topcoder. Please check your connection and try again.',
    invalidCredentials: 'Invalid Authentication credentials. Please check your credentials and try again.',
    noGlobalConfig: 'Topcoder config file not found',
    invalidOptions: 'Only one option is required and allowed for this command. Execute topcoder config --help for more details',
    invalidArgs: 'Invalid number of values passed.'
  }
}
