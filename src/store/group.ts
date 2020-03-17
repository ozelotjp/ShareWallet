import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { IGroupDocumentData } from '~/models/Group'

@Module({ name: 'group', namespaced: true, stateFactory: true })
export default class Group extends VuexModule {
  ready = false
  current = '' as string
  list = [] as IGroupDocumentData[]

  get currentGroup(): IGroupDocumentData {
    return this.list.filter(
      (group: IGroupDocumentData) => group.id === this.current
    )[0]
  }

  @Mutation
  INITIALIZE_GROUP(list: IGroupDocumentData[]) {
    this.list = list
    this.ready = true
  }

  @Mutation
  SET_CURRENT_GROUP(id: string) {
    this.current = id
  }

  @Action
  initializeGroup(list: IGroupDocumentData[]) {
    this.INITIALIZE_GROUP(list)
  }

  @Action
  selectGroup(id: string) {
    this.SET_CURRENT_GROUP(id)
  }
}
