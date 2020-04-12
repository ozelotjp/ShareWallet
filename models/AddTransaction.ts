export interface IAddTransaction {
  group: string
  title: string
  users: {
    [uid: string]: {
      diff: number
    }
  }
}
