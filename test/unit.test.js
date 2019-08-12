/* eslint-env mocha */
/*
 * Unit test here.
 */
const chai = require('chai')
const helper = require('../src/common/helper')
const testHelper = require('./common/testHelper')
const uploadSubmissionService = require('../src/services/uploadSubmissionService')
const testData = require('./common/testData')
const _ = require('lodash')

describe('TC Submission CLI Test', async function () {
  it('helper.createSubmission() - It should create submission with valid reqeust payload', async function () {
    await helper.createSubmission(
      testData.sampleZipFilename,
      testData.sampleZipFile,
      testData.token.admin,
      testData.userId.admin,
      testData.challengeId.valid
    )
  })
  it('helper.tokenFromCredentials() - It should obtain JWT token from TC login service by providing correct username and password', async function () {
    const token = await helper.tokenFromCredentials(testData.sampleRCObject.username, testData.sampleRCObject.password)
    chai.expect(token).to.eql(testData.token.admin)
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
      testData.token.admin,
      testData.userId.admin,
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
})
