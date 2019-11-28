/* eslint-env mocha */
/*
 * Unit test here.
 */
const chai = require('chai')
const helper = require('../src/common/helper')
const testHelper = require('./common/testHelper')
const uploadSubmissionService = require('../src/services/uploadSubmissionService')
const authService = require('../src/services/authService')
const errors = require('../src/common/errors')
const config = require('../src/commands/config')
const testData = require('./common/testData')
const _ = require('lodash')
const fs = require('fs')

describe('TC Submission CLI Test', async function () {
  it('helper.createSubmission() - It should create submission with valid reqeust payload', async function () {
    await helper.createSubmission(
      testData.sampleZipFilename,
      testData.sampleZipFile,
      testData.userId.admin,
      'TonyJ',
      'appirio123',
      testData.challengeId.valid
    )
  })

  it('helper.archiveCodebase() - It should ignore topcoder rc file', async function () {
    const zipArchive = helper.archiveCodebase(testData.testCodebases.withRCFile)
    const entries = testHelper.listZipEntries(zipArchive)
    chai.expect(entries.length).to.equal(2) // there should be three files under the directory if .topcoderrc is included
  })

  it('uploadSubmissionService.smart() - It should create submission from a codebase with valid RC file', async function () {
    await uploadSubmissionService.smart(testData.testCodebases.withRCFile)
  })

  it('uploadSubmissionService.basic() - It should create submission with valid RC configs', async function () {
    await uploadSubmissionService.basic(
      testData.sampleZipFilename,
      testData.sampleZipFile,
      testData.userId.admin,
      'TonyJ',
      'appirio123',
      [testData.challengeId.valid]
    )
  })

  it('topcoderrc - It should check if topcoder rc file exists', async function () {
    try {
      await uploadSubmissionService.smart(testData.testCodebases.withoutRCFile)
      throw Error('Test failed')
    } catch (err) {
      chai.expect(err.message).to.include('no such file')
    }
  })

  it('topcoderrc - It should check if topcoder rc file has valid json syntax', async function () {
    try {
      await uploadSubmissionService.smart(testData.testCodebases.invalidRCFile)
      throw Error('Test failed')
    } catch (err) {
      chai.expect(err.message).to.include('Unexpected token')
    }
  })

  it('topcoderrc - It should check if field challengeIds is empty', async function () {
    try {
      helper.validateRCObject({
        challengeIds: [],
        ..._.pick(testData.sampleRCObject, ['username', 'password'])
      })
      throw Error('Test failed')
    } catch (err) {
      chai.expect(err.message).to.include('must contain at least 1 items')
    }
  })

  for (const field of ['challengeIds', 'username', 'password']) {
    it(`topcoderrc - It should check if field ${field} exists in topcoder rc file`, async function () {
      try {
        helper.validateRCObject(_.omit(testData.sampleRCObject, [field]))
        throw Error('Test failed')
      } catch (err) {
        chai.expect(err.message).to.include('is required')
      }
    })
  }

  it('config throws error when 2 or more options in command used', async function () {
    try {
      config.handleSubCommand(['50',
        {
          // some extra object attributes here....
          // these 2 options were passed in command
          list: true,
          add: '20',
          // faking out opts function.
          opts: () => {
            return { list: true, add: '20' }
          }
        }
      ])
    } catch (err) {
      chai.expect(err.message).to.include('Invalid group of options. Try with only one option.')
    }
  })

  it('config runs without error when 1 option in command used', async function () {
    fs.writeFileSync(config.configPath, ' ')
    config.handleSubCommand([
      {
        // some extra object attributes here....
        // this option were passed in command
        list: true,
        // faking out opts function.
        opts: () => {
          return { list: true }
        }
      }
    ])
    config.handleSubCommand(['50',
      {
        // some extra object attributes here....
        // this option were passed in command
        add: 'm2m.client_secret',
        // faking out opts function.
        opts: () => {
          return { add: 'm2m.client_secret' }
        }
      }
    ])
    fs.unlinkSync(config.configPath)
  })

  it('config throws error when invalid key used while adding config', async function () {
    try {
      fs.writeFileSync(config.configPath, ' ')
      config.handleSubCommand(['50',
        {
          // some extra object attributes here....
          add: '20',
          // faking out opts function.
          opts: () => {
            return { add: '20' }
          }
        }
      ])
      fs.unlinkSync(config.configPath)
    } catch (err) {
      chai.expect(err.message).to.include('Invalid key value')
      fs.unlinkSync(config.configPath)
    }
  })

  it('showConfigFile runs without errors when list option is passed and config file present', async function () {
    fs.writeFileSync(config.configPath, ' ')
    config.showConfigFile(config.configPath)
    fs.unlinkSync(config.configPath)
  })

  it('showConfigFile raises error when config file absent', async function () {
    try {
      fs.writeFileSync(config.configPath, ' ')
      fs.unlinkSync(config.configPath)
      config.showConfigFile(config.configPath)
    } catch (err) {
      chai.expect(err.message).to.include('no global config file found')
    }
  })

  it('m2m should occur without errors', async function () {
    config.addToConfigFile('m2m.client_id', testData.sampleIniObject.m2m.client_id)
    config.addToConfigFile('m2m.client_secret', testData.sampleIniObject.m2m.client_secret)
    await authService.m2mAuth({})
  })

  describe('Different types of errors test', async function () {
    it('should return RC validation failed Error when called', async function () {
      chai.expect(errors.RCValidationError(new Error()).message).to.contain('RC validation failed')
    })

    it('should return No Global Config Found Error when called', async function () {
      chai.expect(errors.noGlobalConfigFileFoundError().message).to.contain('no global config file found')
    })

    it('should return Invalid No of options used Error when called', async function () {
      chai.expect(errors.invalidNoOfOptionsUsedError().message).to.contain('Invalid group of options')
    })

    it('should return Invalid no of values passed Error when called', async function () {
      chai.expect(errors.invalidNoOfArgsPassedError().message).to.contain('Invalid number of values passed')
    })

    it('should return invalide key for config file Error when called', async function () {
      chai.expect(errors.invalidKeyForConfigFileError([]).message).to.contain('Invalid key value')
    })
  })
})
