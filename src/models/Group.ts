export interface IGroupDocumentData {
  id: string
  title: string
  updatedAt: firebase.firestore.Timestamp
  user: {
    [uid: string]: {
      name: string
      role: 'owner' | 'moderator' | 'write' | 'read'
      wallet: number
    }
  }
}

export interface IGroupHistoryDocumentData {
  id: string
  author: string
  change: {
    [uid: string]: number
  }
  createdAt: firebase.firestore.Timestamp
  title: string
}
