import { Middleware } from '@nuxt/types'
import { groupStore } from '~/store'
import { IGroupDocumentData } from '~/models/Group'

const myMiddleware: Middleware = ({ redirect, app: { $firebase } }) => {
  if ($firebase.auth().currentUser === null) {
    redirect('/signin')
    return
  }
  if (groupStore.ready === false) {
    $firebase
      .firestore()
      .collection('group')
      .where(`users.${$firebase.auth().currentUser?.uid}.role`, 'in', [
        'owner',
        'moderator',
        'write',
        'read'
      ])
      .get()
      .then((documentsQuery) => {
        const group = [] as IGroupDocumentData[]
        documentsQuery.docs.forEach((document) => {
          group.push(
            Object.assign(document.data(), {
              id: document.id
            }) as IGroupDocumentData
          )
        })
        groupStore.initializeGroup(group)
      })
  }
}

export default myMiddleware
