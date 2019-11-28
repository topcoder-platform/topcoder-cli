/*
 * Production or default configuration for the Topcoder CLI
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  TC_MEMBERS_API: process.env.TC_MEMBERS_API || 'https://api.topcoder.com/v3/members',
  SUBMISSION_API_URL: process.env.TEST_SUBMISSION_API_URL || 'https://api.topcoder.com/v5/submissions',
  AUTH0_URL: process.env.AUTH0_URL || 'https://topcoder.auth0.com/oauth/token',
  TC_AUTHN_URL: process.env.TC_AUTHN_URL || 'https://topcoder.auth0.com/oauth/ro',
  TC_AUTHZ_URL: process.env.TC_AUTHZ_URL || 'https://api.topcoder.com/v3/authorizations',
  TC_CLIENT_ID: process.env.TC_CLIENT_ID || '6ZwZEUo2ZK4c50aLPpgupeg5v2Ffxp9P',
  TC_CLIENT_V2CONNECTION: process.env.CLIENT_V2CONNECTION || 'TC-User-Database'
}
