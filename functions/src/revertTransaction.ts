import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { IRevertTransaction } from '../../models/RevertTransaction'
import { IGroupDocumentData } from '../../models/GroupDocument'
import { IGroupHistoryDocumentData } from '../../models/GroupHistoryDocument'
import { IRoleKey } from '../../models/Role'

module.exports = functions
  .region('asia-northeast1')
  .https.onCall((data: IRevertTransaction, context) => {
    // check: bad request
    if (
      typeof context.auth !== 'object' ||
      typeof context.auth.uid !== 'string' ||
      typeof data.group !== 'string' ||
      data.group === '' ||
      typeof data.history !== 'string' ||
      data.history === ''
    ) {
      throw new Error('bad request')
    }

    const uid = context.auth.uid
    const now = admin.firestore.Timestamp.now()
    const permission = ['admin', 'write'] as IRoleKey[]

    return admin.firestore().runTransaction(async (transaction) => {
      const groupRef = admin.firestore().collection('group').doc(data.group)
      const historyRef = groupRef.collection('histories').doc(data.history)
      const latestHisotiresRef = groupRef
        .collection('histories')
        .orderBy('createdAt', 'desc')
        .limit(1)

      // get snapshot
      const groupSnapshot = await transaction.get(groupRef)

      // check exists
      if (groupSnapshot.exists === false) {
        throw new Error('not found')
      }

      // get data
      const groupData = {
        ...groupSnapshot.data(),
        id: groupSnapshot.id
      } as IGroupDocumentData

      // check permission
      if (permission.includes(groupData.users[uid].role) === false) {
        throw new Error('denied')
      }

      // get snapshot
      const historySnapshot = await historyRef.get()

      // check exists
      if (historySnapshot.exists === false) {
        throw new Error('not found')
      }

      // get data
      const historyData = {
        ...historySnapshot.data(),
        id: historySnapshot.id
      } as IGroupHistoryDocumentData

      // update group
      const groupDataMerge = {
        updatedAt: now,
        users: {}
      } as {
        updatedAt: firebase.firestore.Timestamp
        users: { [uid: string]: { wallet: number } }
      }
      Object.keys(historyData.users).forEach((userId) => {
        groupDataMerge.users[userId] = {
          wallet:
            groupData.users[userId].wallet - historyData.users[userId].wallet
        }
      })
      transaction.set(groupRef, groupDataMerge, { merge: true })

      // check the latest history
      const latestHistoriesSnapshot = await latestHisotiresRef.get()
      let latestHistoryId = ''
      latestHistoriesSnapshot.forEach((latestHistorySnapshot) => {
        latestHistoryId = latestHistorySnapshot.id
      })
      const isLatestHistory = historyData.id === latestHistoryId

      // add or delete history
      if (isLatestHistory) {
        return historyRef.delete().catch((error) => {
          throw new Error(error)
        })
      } else {
        return groupRef
          .collection('histories')
          .add({
            author: uid,
            createdAt: now,
            title: `【取消】${historyData.title}`,
            users: (() => {
              const users = {} as {
                [uid: string]: { diff: number; wallet: number }
              }
              Object.keys(historyData.users).forEach((userId) => {
                users[userId] = {
                  diff: -historyData.users[userId].diff,
                  wallet:
                    groupData.users[userId].wallet -
                    historyData.users[userId].wallet
                }
              })
              return users
            })()
          })
          .catch((error) => {
            throw new Error(error)
          })
      }
    })
  })
