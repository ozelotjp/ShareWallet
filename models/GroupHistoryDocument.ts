import firebase from 'firebase'

export interface IGroupHistoryDocumentData {
  id: string
  author: string
  createdAt: firebase.firestore.Timestamp
  title: string
  users: [
    {
      uid: string
      change: number
      wallet: number
    }
  ]
}
