import { IRoleKey, IRoleName } from '@@/models/Role'

const roleList = [
  { key: 'admin', name: '管理者' },
  { key: 'write', name: '読み書き' },
  { key: 'read', name: '閲覧のみ' },
  { key: 'invalid', name: '無効' }
] as { key: IRoleKey; name: IRoleName }[]

export const convertRoleNameFromKey = (roleKey: IRoleKey): IRoleName => {
  return roleList.filter((role) => role.key === roleKey)[0]?.name
}

export const convertRoleKeyFromName = (roleName: IRoleName): IRoleKey => {
  return roleList.filter((role) => role.name === roleName)[0]?.key
}
