import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { IJoinGroup } from '../../models/JoinGroup'
import { IGroupInviteDocumentData } from '../../models/GroupInviteDocument'

module.exports = functions
  .region('asia-northeast1')
  .https.onCall((data: IJoinGroup, { auth }) => {
    // check: bad request
    if (
      typeof auth !== 'object' ||
      typeof auth.uid !== 'string' ||
      typeof data.group !== 'string' ||
      data.group === '' ||
      typeof data.key !== 'string' ||
      data.key === '' ||
      typeof data.name !== 'string' ||
      data.name === ''
    ) {
      throw new Error('bad request')
    }

    return admin
      .firestore()
      .collection('group')
      .doc(data.group)
      .collection('invite')
      .doc(data.key)
      .get()
      .then((inviteSnapshot) => {
        if (inviteSnapshot.exists === false) {
          throw new Error('not found')
        }
        const inviteData = {
          ...inviteSnapshot.data(),
          id: inviteSnapshot.id
        } as IGroupInviteDocumentData
        return admin
          .firestore()
          .collection('group')
          .doc(data.group)
          .set(
            {
              users: {
                [auth.uid]: {
                  name: data.name,
                  role: inviteData.role,
                  wallet: 0
                }
              }
            },
            { merge: true }
          )
          .then(() => {
            if (inviteData.permanent === false) {
              inviteSnapshot.ref.delete().catch((error) => {
                throw new Error(error)
              })
            }
          })
          .catch((error) => {
            throw new Error(error)
          })
      })
      .catch((error) => {
        throw new Error(error)
      })
  })
