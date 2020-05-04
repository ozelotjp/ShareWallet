import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { IRevertTransaction } from '../../models/RevertTransaction'
import { IGroupDocumentData } from '../../models/GroupDocument'
import { IGroupTransactionDocumentData } from '../../models/GroupTransactionDocument'
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
      typeof data.transaction !== 'string' ||
      data.transaction === ''
    ) {
      throw new Error('bad request')
    }

    const uid = context.auth.uid
    const now = admin.firestore.Timestamp.now()
    const permission = ['admin', 'write'] as IRoleKey[]

    return admin.firestore().runTransaction(async (transaction) => {
      const groupRef = admin.firestore().collection('group').doc(data.group)
      const transactionRef = groupRef
        .collection('transactions')
        .doc(data.transaction)
      const latestHisotiresRef = groupRef
        .collection('transactions')
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
      const transactionSnapshot = await transactionRef.get()

      // check exists
      if (transactionSnapshot.exists === false) {
        throw new Error('not found')
      }

      // get data
      const transactionData = {
        ...transactionSnapshot.data(),
        id: transactionSnapshot.id
      } as IGroupTransactionDocumentData

      // update group
      const groupDataMerge = {
        updatedAt: now,
        users: {}
      } as {
        updatedAt: firebase.firestore.Timestamp
        users: { [uid: string]: { wallet: number } }
      }
      Object.keys(transactionData.users).forEach((userId) => {
        groupDataMerge.users[userId] = {
          wallet:
            groupData.users[userId].wallet -
            transactionData.users[userId].wallet
        }
      })
      transaction.set(groupRef, groupDataMerge, { merge: true })

      // check the latest transaction
      const latestTransactionsSnapshot = await latestHisotiresRef.get()
      let latestTransactionId = ''
      latestTransactionsSnapshot.forEach((latestTransactionSnapshot) => {
        latestTransactionId = latestTransactionSnapshot.id
      })
      const isLatestTransaction = transactionData.id === latestTransactionId
      const isWithinAnHour =
        transactionData.createdAt.seconds >= now.seconds - 3600

      // add or delete transaction
      if (isLatestTransaction && isWithinAnHour) {
        return transactionRef.delete().catch((error) => {
          throw new Error(error)
        })
      } else {
        return groupRef
          .collection('transactions')
          .add({
            author: uid,
            createdAt: now,
            title: `【取消】${transactionData.title}`,
            users: (() => {
              const users = {} as {
                [uid: string]: { diff: number; wallet: number }
              }
              Object.keys(transactionData.users).forEach((userId) => {
                users[userId] = {
                  diff: -transactionData.users[userId].diff,
                  wallet:
                    groupData.users[userId].wallet -
                    transactionData.users[userId].wallet
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
