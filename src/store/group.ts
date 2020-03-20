import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { IGroupDocumentData } from '~/models/Group'

@Module({ name: 'group', namespaced: true, stateFactory: true })
export default class Group extends VuexModule {
  ready = false
  list = [] as IGroupDocumentData[]

  }

  @Mutation
  INITIALIZE_GROUP(list: IGroupDocumentData[]) {
    this.list = list
    this.ready = true
  }

  @Action
  initializeGroup(list: IGroupDocumentData[]) {
    this.INITIALIZE_GROUP(list)
  }
}
