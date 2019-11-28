/*
 * Error wrapper
 */

function customError (message) {
  return new Error(message)
}

module.exports = {
  customError
}
