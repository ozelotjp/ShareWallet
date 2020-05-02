import { IRoleKey } from './Role'

export interface IUpdateUser {
  group: string
  user: {
    id: string
    name: string
    role: IRoleKey
  }
}
