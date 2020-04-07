export interface IGroupHistoryFunction {
  group: string
  title: string
  users: [
    {
      uid: string
      change: number
    }
  ]
}
