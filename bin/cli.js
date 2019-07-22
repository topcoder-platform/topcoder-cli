#!/usr/bin/env node
process.env.NODE_CONFIG_DIR = `${__dirname}/../config/`

const uploadSubmissionService = require('../src/services/uploadSubmissionService')
const logger = require('../src/common/logger')

uploadSubmissionService.smart(process.cwd())
  .then(() => {
    logger.info('done!')
    process.exit()
  })
  .catch(err => {
    logger.error(err.message)
    process.exit(1)
  })
