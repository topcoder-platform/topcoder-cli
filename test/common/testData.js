/*
 * Data for tests.
 */

const challengeIdWithZeroSubmissions = '20109'
const submissionIdNotInChallenge = 'b8ee3343-f3cf-4f39-9618-04a70b900a68'
const submissionIdWithZeroArtifacts = 'bacacaa1-056f-4438-bf02-c9efe6334b2f'

module.exports = {
  token: {
    admin:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJUb3Bjb2RlciBVc2VyIiwiQ29ubmVjdCBTdXBwb3J0IiwiYWRtaW5pc3RyYXRvciIsInRlc3RSb2xlIiwiYWFhIiwidG9ueV90ZXN0XzEiLCJDb25uZWN0IE1hbmFnZXIiLCJDb25uZWN0IEFkbWluIiwiY29waWxvdCIsIkNvbm5lY3QgQ29waWxvdCBNYW5hZ2VyIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLWRldi5jb20iLCJoYW5kbGUiOiJUb255SiIsImV4cCI6MTU4MTc5MjIxMSwidXNlcklkIjoiODU0Nzg5OSIsImlhdCI6MTU0OTc5MTYxMSwiZW1haWwiOiJ0amVmdHMrZml4QHRvcGNvZGVyLmNvbSIsImp0aSI6ImY5NGQxZTI2LTNkMGUtNDZjYS04MTE1LTg3NTQ1NDRhMDhmMSJ9.3nxk6c9P1GBWQ__XPsouddjXHAA3s_7t4E83tbFSFCA',
    m2m: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik5VSkZORGd4UlRVME5EWTBOVVkzTlRkR05qTXlRamxETmpOQk5UYzVRVUV3UlRFeU56TTJRUSJ9.eyJpc3MiOiJodHRwczovL3RvcGNvZGVyLWRldi5hdXRoMC5jb20vIiwic3ViIjoibWFFMm1hQlN2OWZSVkhqU2xDMzFMRlpTcTZWaGhacUNAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbTJtLnRvcGNvZGVyLWRldi5jb20vIiwiaWF0IjoxNTc1MjMyNTMyLCJleHAiOjE1NzUzMTg5MzIsImF6cCI6Im1hRTJtYUJTdjlmUlZIalNsQzMxTEZaU3E2VmhoWnFDIiwic2NvcGUiOiJyZWFkOmNoYWxsZW5nZXMgd3JpdGU6Y2hhbGxlbmdlcyByZWFkOmdyb3VwcyB1cGRhdGU6c3VibWlzc2lvbiByZWFkOnN1Ym1pc3Npb24gZGVsZXRlOnN1Ym1pc3Npb24gY3JlYXRlOnN1Ym1pc3Npb24gYWxsOnN1Ym1pc3Npb24gdXBkYXRlOnJldmlld190eXBlIHJlYWQ6cmV2aWV3X3R5cGUgZGVsZXRlOnJldmlld190eXBlIGFsbDpyZXZpZXdfdHlwZSB1cGRhdGU6cmV2aWV3X3N1bW1hdGlvbiByZWFkOnJldmlld19zdW1tYXRpb24gZGVsZXRlOnJldmlld19zdW1tYXRpb24gY3JlYXRlOnJldmlld19zdW1tYXRpb24gYWxsOnJldmlld19zdW1tYXRpb24gdXBkYXRlOnJldmlldyByZWFkOnJldmlldyBkZWxldGU6cmV2aWV3IGNyZWF0ZTpyZXZpZXcgYWxsOnJldmlldyByZWFkOmJ1c190b3BpY3Mgd3JpdGU6YnVzX2FwaSByZWFkOnVzZXJfcHJvZmlsZXMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.YAunJfjPGZ0UM0an8UI0ISDiE31eWi9LOWUXFT8P_xftn2V0BkOlGpcm6zlMEMS4eR0LAInZS7WY6bfQW7z3Csl7untnrp2EwRh9gQWndcJejf6XizfhEvCwhbAVeS-95sS2vuxsG9WSsAXp6pcrBayzRFPMa5kUzolB1sExeUypkdGI5jR4gDF-NC7B1zHAsseHVyL3SknlDnzSbt0S6rAOX6BEXzaYERgmX5AtIdN4cZ9cwAikQkEj27ZhmYRR4gMaAZLK6sAC9Do7Rbux4yLQwVToAE2S2PQ7ehGHlHveVlCkRx1VGLIBAmsZp9He-t_uWSxU9n7ILDVhMsomTw',
    idToken: 'fake id token'
  },
  responses: {
    submissionAPI: {
      OK: {
        id: 'bbe251a2-109f-415b-9ade-feb5623085d0',
        type: 'ContestSubmission',
        url:
          'https://topcoder-submissions-dmz.s3.amazonaws.com/bbe251a2-109f-415b-9ade-feb5623085d0.zip',
        memberId: 40687077,
        challengeId: 30095545,
        created: '2019-07-13T18:29:14.482Z',
        updated: '2019-07-13T18:29:14.482Z',
        createdBy: 'aaron2017',
        updatedBy: 'aaron2017',
        submissionPhaseId: 1128630,
        fileType: 'zip'
      },
      searchSubmissions: require('./submissions.json'),
      searchArtifacts: {
        artifacts: [
          'c781b043-17c1-45a5-9004-8515286a1997',
          'e9821bb7-1a78-42ac-aea7-deeea14f7dd8',
          '633591fe-e26b-4e48-bb11-bf83b25d65ae',
          '1d1c7358-627b-48b2-a201-1fa949052e78',
          '3917cebb-2f22-4172-a19e-507d1fad83b3'
        ]
      }
    },
    membersAPI: {
      id: '3aab742d:16c1acc1c39:-7d7b',
      result: {
        success: true,
        status: 200,
        content: {
          userId: 8547899
        }
      },
      version: 'v3'
    }
  },
  m2mConfig: {
    m2m: {
      client_id: 'ajksbsnsj',
      client_secret: 'vvdhdbhbdhbdn_djdj'
    }
  },
  userCredentials: {
    username: 'TonyJ',
    password: 'xxx123'
  },
  challengeIdWithZeroSubmissions,
  submissionIdNotInChallenge,
  submissionIdWithZeroArtifacts,
  // variables used for the communication between tests and mock server.
  _variables: {
    submissionDownloadInfo: [],
    artifactDownloadInfo: [],
    uploadedSubmissionInfo: [],
    needErrorResponse: false // used to instruct nock server to return error response or not
  }
}
