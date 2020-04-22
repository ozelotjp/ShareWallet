import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { IGroupDocumentData } from '@@/models/GroupDocument'

@Module({ name: 'group', namespaced: true, stateFactory: true })
export default class Group extends VuexModule {
  ready = false
  list = [] as IGroupDocumentData[]

  get getGroup() {
    return (id: string) => {
      return this.list.filter((group) => group.id === id)[0] || undefined
    }
  }

  @Mutation
  UPDATE_READY(ready: boolean) {
    this.ready = ready
  }

  @Mutation
  UPDATE_GROUP(document: IGroupDocumentData) {
    this.list.push(document)
  }

  @Action
  updateReady(ready: boolean) {
    this.UPDATE_READY(ready)
  }

  @Action
  updateGroup(snapshot: firebase.firestore.QueryDocumentSnapshot) {
    this.UPDATE_GROUP(
      Object.assign(snapshot.data(), {
        id: snapshot.id
      }) as IGroupDocumentData
    )
  }
}
