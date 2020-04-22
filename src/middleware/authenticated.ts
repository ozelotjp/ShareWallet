import { Middleware } from '@nuxt/types'
import { groupStore, authenticatedStore } from '@/store'

const myMiddleware: Middleware = async ({
  redirect,
  route,
  app: { $firebase }
}) => {
  if ($firebase.auth().currentUser === null) {
    authenticatedStore.setNextUrl(route.path)
    redirect('/signin')
    return
  }
  if (groupStore.ready === false) {
    const querySnapshot = await $firebase
      .firestore()
      .collection('group')
      .where(`users.${$firebase.auth().currentUser?.uid}.role`, 'in', [
        'owner',
        'moderator',
        'write',
        'read'
      ])
      .get()

    querySnapshot.query.onSnapshot((document) => {
      document.docChanges().forEach((change) => {
        groupStore.updateGroup(change.doc)
      })
      groupStore.updateReady(true) // 重複して実行されるのは許容
    })
  }
}

export default myMiddleware
