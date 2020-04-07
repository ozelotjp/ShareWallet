export interface IGroupDocumentData {
  id: string
  title: string
  updatedAt: firebase.firestore.Timestamp
  users: {
    [uid: string]: {
      name: string
      role: 'owner' | 'moderator' | 'write' | 'read'
      wallet: number
    }
  }
}
