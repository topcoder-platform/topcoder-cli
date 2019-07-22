/*
 * Helper functions for test.
 */
const AdmZip = require('adm-zip')

function listZipEntries (buffer) {
  const zip = new AdmZip(buffer)
  return zip.getEntries()
}

module.exports = {
  listZipEntries
}
