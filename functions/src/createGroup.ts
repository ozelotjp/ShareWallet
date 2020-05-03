import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { ICreateGroup } from '../../models/CreateGroup'
import { IGroupDocumentData } from '../../models/GroupDocument'

module.exports = functions
  .region('asia-northeast1')
  .https.onCall((data: ICreateGroup, context) => {
    // check: bad request
    if (
      typeof context.auth !== 'object' ||
      typeof context.auth.uid !== 'string' ||
      typeof data.name !== 'string' ||
      data.name === '' ||
      typeof data.username !== 'string' ||
      data.username === ''
    ) {
      throw new Error('bad request')
    }

    const myUid = context.auth?.uid
    const now = admin.firestore.Timestamp.now()
    const group = {
      title: data.name,
      updatedAt: now,
      users: {
        [myUid]: {
          name: data.username,
          role: 'admin',
          wallet: 0
        }
      }
    } as IGroupDocumentData

    return admin
      .firestore()
      .collection('group')
      .add(group)
      .then((ref) => {
        return { groupId: ref.id }
      })
      .catch((error) => {
        throw new Error(error)
      })
  })
