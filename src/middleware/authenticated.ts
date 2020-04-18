import { Middleware } from '@nuxt/types'
import { IGroupDocumentData } from '@@/models/GroupDocument'
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
    const documentsQuery = await $firebase
      .firestore()
      .collection('group')
      .where(`users.${$firebase.auth().currentUser?.uid}.role`, 'in', [
        'owner',
        'moderator',
        'write',
        'read'
      ])
      .get()
    const group = [] as IGroupDocumentData[]
    documentsQuery.docs.forEach((document) => {
      group.push(
        Object.assign(document.data(), {
          id: document.id
        }) as IGroupDocumentData
      )
    })
    groupStore.initializeGroup(group)
  }
}

export default myMiddleware
