/* Dynamically return config values based on the NODE_ENV variable */

const dev = require('../config/dev')
const prod = require('../config/prod')

module.exports = () => {
  switch (process.env.NODE_ENV) {
    case 'dev':
      return dev
    default:
      return prod
  }
}
