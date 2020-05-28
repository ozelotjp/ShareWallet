import { Middleware } from '@nuxt/types'
import { IRoleKey } from '@@/models/Role'
import { authenticatedStore, groupStore } from '@/store'

const myMiddleware: Middleware = async ({
  redirect,
  app: { $firebase },
  route
}) => {
  await new Promise<firebase.User>((resolve, reject) => {
    $firebase
      .auth()
      .onAuthStateChanged((user) =>
        user === null ? reject(new Error()) : resolve(user)
      )
  })
    .then((user) => {
      console.log(`Authenticated as ${user.uid}`)
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
    })
    .catch(() => {
      authenticatedStore.setNextUrl(route.path)
      redirect('/auth/login')
    })
}

export default myMiddleware
