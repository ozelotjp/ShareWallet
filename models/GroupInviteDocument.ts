import { IRoleKey } from './Role'

export interface IGroupInviteDocumentData {
  id: string
  role: IRoleKey
  permanent: boolean
}
