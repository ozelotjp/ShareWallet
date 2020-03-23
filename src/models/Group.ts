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

export interface IGroupHistoryDocumentData {
  id: string
  author: string
  createdAt: firebase.firestore.Timestamp
  title: string
  user: {
    [uid: string]: {
      change: number
      wallet: number
    }
  }
}
