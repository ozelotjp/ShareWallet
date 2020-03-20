import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { IGroupDocumentData } from '~/models/Group'

@Module({ name: 'group', namespaced: true, stateFactory: true })
export default class Group extends VuexModule {
  ready = false
  list = [] as IGroupDocumentData[]

  get group() {
    return (id: string) => {
      return this.list.filter((group) => group.id === id)[0]
    }
  }

  @Mutation
  INITIALIZE_GROUP(list: IGroupDocumentData[]) {
    list.forEach((group) => {
      this.list.push(group)
    })
    this.ready = true
  }

  @Action
  initializeGroup(list: IGroupDocumentData[]) {
    this.INITIALIZE_GROUP(list)
  }
}
