import { Middleware } from '@nuxt/types'
import { IRoleKey } from '@@/models/Role'
import { groupStore, authenticatedStore } from '@/store'

const myMiddleware: Middleware = ({ redirect, route, app: { $firebase } }) => {
  if ($firebase.auth().currentUser === null) {
    authenticatedStore.setNextUrl(route.path)
    redirect('/signin')
    return
  }
  if (groupStore.ready === false) {
    $firebase
      .firestore()
      .collection('group')
      .where(`users.${$firebase.auth().currentUser?.uid}.role`, 'in', [
        'admin',
        'write',
        'read'
      ] as IRoleKey[])
      .onSnapshot((document) => {
        document.docChanges().forEach((change) => {
          switch (change.type) {
            case 'added':
            case 'modified':
              groupStore.updateGroup(change.doc)
              break
            case 'removed':
              groupStore.removeGroup(change.doc)
              break
          }
        })
        groupStore.updateReady(true) // 重複して実行されるのは許容
      })
  }
}

export default myMiddleware
