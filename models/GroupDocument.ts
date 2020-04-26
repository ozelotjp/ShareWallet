import firebase from 'firebase'
import { IRoleKey } from './Role'

export interface IGroupDocumentData {
  id: string
  title: string
  updatedAt: firebase.firestore.Timestamp
  users: {
    [uid: string]: {
      name: string
      role: IRoleKey
      wallet: number
    }
  }
}
