import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { IUpdateUser } from '../../models/UpdateUser'
import { IGroupDocumentData } from '../../models/GroupDocument'
import { IRoleKey } from '../../models/Role'

module.exports = functions
  .region('asia-northeast1')
  .https.onCall((data: IUpdateUser, { auth }) => {
    const roles = ['admin', 'write', 'read', 'invalid'] as IRoleKey[]
    // check: bad request
    if (
      typeof auth !== 'object' ||
      typeof auth.uid !== 'string' ||
      typeof data.group !== 'string' ||
      data.group === '' ||
      typeof data.user !== 'object' ||
      typeof data.user.id !== 'string' ||
      typeof data.user.name !== 'string' ||
      typeof data.user.role !== 'string' ||
      roles.includes(data.user.role) === false
    ) {
      throw new Error('bad request')
    }

    return admin
      .firestore()
      .collection('group')
      .doc(data.group)
      .get()
      .then((snapshot) => {
        if (snapshot.exists === false) {
          throw new Error('not found')
        }
        const groupData = {
          ...snapshot.data(),
          id: snapshot.id
        } as IGroupDocumentData
        if (groupData.users[auth.uid].role !== 'admin') {
          throw new Error('denied access')
        }
        if (typeof groupData.users[data.user.id] === 'undefined') {
          throw new TypeError('not exists user')
        }
        return snapshot.ref
          .set(
            {
              users: {
                [data.user.id]: {
                  name: data.user.name,
                  role: data.user.role
                }
              }
            },
            { merge: true }
          )
          .catch((error) => {
            throw new Error(error)
          })
      })
      .catch((error) => {
        throw new Error(error)
      })
  })
