import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { IAddTransaction } from '../../models/AddTransaction'
import { IGroupDocumentData } from '../../models/GroupDocument'

admin.initializeApp(functions.config().firebase)

export const addTransaction = functions
  .region('asia-northeast1')
  .https.onCall((data: IAddTransaction, context) => {
    console.debug({ data, context })
    // check: bad request
    if (
      typeof context.auth !== 'object' ||
      typeof context.auth.uid !== 'string' ||
      typeof data.group !== 'string' ||
      data.group === '' ||
      typeof data.title !== 'string' ||
      data.title === '' ||
      typeof data.users !== 'object' ||
      Object.keys(data.users).length === 0 ||
      Object.keys(data.users).reduce(
        (total, uid) => total + data.users[uid].diff,
        0
      ) !== 0
    ) {
      throw new Error('bad request')
    }

    const myUid = context.auth?.uid
    const now = admin.firestore.Timestamp.now()

    return admin.firestore().runTransaction(async (transaction) => {
      const groupDocument = await transaction.get(
        admin.firestore().collection('group').doc(data.group)
      )
      // check: not found
      if (groupDocument.exists === false) {
        throw new Error('not found')
      }
      const groupDocumentData = Object.assign(groupDocument.data(), {
        id: groupDocument.id
      }) as IGroupDocumentData

      // check: access denied
      if (
        ['owner', 'moderator', 'write'].includes(
          groupDocumentData.users[myUid].role || ''
        ) === false
      ) {
        throw new Error('denied')
      }

      // update group document
      transaction.set(
        groupDocument.ref,
        {
          updatedAt: now,
          users: (() => {
            const users = {} as {
              [uid: string]: {
                wallet: number
              }
            }
            Object.keys(data.users).forEach((uid) => {
              users[uid] = {
                wallet:
                  groupDocumentData.users[uid].wallet + data.users[uid].diff
              }
            })
            return users
          })()
        } as IGroupDocumentData,
        { merge: true }
      )

      // add history document
      await groupDocument.ref.collection('histories').add({
        author: myUid,
        createdAt: now,
        title: data.title,
        users: (() => {
          const users = {} as {
            [uid: string]: {
              diff: number
              wallet: number
            }
          }
          Object.keys(data.users).forEach((uid) => {
            users[uid] = {
              diff: data.users[uid].diff,
              wallet: groupDocumentData.users[uid].wallet + data.users[uid].diff
            }
          })
          return users
        })()
      })
    })
  })
