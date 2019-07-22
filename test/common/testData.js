/*
 * Data for tests.
 */
const fs = require('fs')

module.exports = {
  token: {
    admin: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJUb3Bjb2RlciBVc2VyIiwiQ29ubmVjdCBTdXBwb3J0IiwiYWRtaW5pc3RyYXRvciIsInRlc3RSb2xlIiwiYWFhIiwidG9ueV90ZXN0XzEiLCJDb25uZWN0IE1hbmFnZXIiLCJDb25uZWN0IEFkbWluIiwiY29waWxvdCIsIkNvbm5lY3QgQ29waWxvdCBNYW5hZ2VyIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLWRldi5jb20iLCJoYW5kbGUiOiJUb255SiIsImV4cCI6MTU4MTc5MjIxMSwidXNlcklkIjoiODU0Nzg5OSIsImlhdCI6MTU0OTc5MTYxMSwiZW1haWwiOiJ0amVmdHMrZml4QHRvcGNvZGVyLmNvbSIsImp0aSI6ImY5NGQxZTI2LTNkMGUtNDZjYS04MTE1LTg3NTQ1NDRhMDhmMSJ9.3nxk6c9P1GBWQ__XPsouddjXHAA3s_7t4E83tbFSFCA',
    idToken: 'fake id token'
  },
  userId: {
    admin: '8547899'
  },
  challengeId: {
    valid: '30095545'
  },
  sampleZipFilename: 'test_zip_file.zip',
  sampleZipFile: fs.readFileSync('./test/common/test_zip_file.zip'),
  responses: {
    submissionAPI: {
      OK: {
        id: 'bbe251a2-109f-415b-9ade-feb5623085d0',
        type: 'ContestSubmission',
        url: 'https://topcoder-submissions-dmz.s3.amazonaws.com/bbe251a2-109f-415b-9ade-feb5623085d0.zip',
        memberId: 40687077,
        challengeId: 30095545,
        created: '2019-07-13T18:29:14.482Z',
        updated: '2019-07-13T18:29:14.482Z',
        createdBy: 'aaron2017',
        updatedBy: 'aaron2017',
        submissionPhaseId: 1128630,
        fileType: 'zip'
      }
    },
    membersAPI: {
      id: "3aab742d:16c1acc1c39:-7d7b",
      result: {
        success: true,
        status: 200,
        content: {
          userId: 8547899
        }
      },
      version: "v3"
    },
  },
  testCodebases: {
    withRCFile: './test/common/test_codebases/with_rc_file',
    withoutRCFile: './test/common/test_codebases/without_rc_file',
    invalidRCFile: './test/common/test_codebases/rc_file_with_invalid_json_syntax'
  },
  sampleRCObject: {
    'challengeIds': [
      '30095545'
    ],
    'userId': '8547899',
    'username': 'TonyJ',
    'password': 'appirio123'
  }
}
