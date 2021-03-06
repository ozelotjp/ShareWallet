import Vue from 'vue'
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { IGroupDocumentData } from '@@/models/GroupDocument'
import { compareAlphabet } from '@/utils/compareAlphabet'

@Module({ name: 'group', namespaced: true, stateFactory: true })
export default class Group extends VuexModule {
  ready = false
  group = {} as { [id: string]: IGroupDocumentData }

  get list() {
    return Object.keys(this.group)
      .map((id) => this.group[id])
      .sort((a, b) => compareAlphabet(a.title, b.title))
  }

  @Mutation
  UPDATE_READY(ready: boolean) {
    this.ready = ready
  }

  @Mutation
  UPDATE_GROUP(document: IGroupDocumentData) {
    Vue.set(this.group, document.id, document)
  }

  @Mutation
  REMOVE_GROUP(document: IGroupDocumentData) {
    Vue.delete(this.group, document.id)
  }

  @Action
  updateReady(ready: boolean) {
    this.UPDATE_READY(ready)
  }

  @Action
  updateGroup(snapshot: firebase.firestore.QueryDocumentSnapshot) {
    this.UPDATE_GROUP({
      ...snapshot.data(),
      id: snapshot.id
    } as IGroupDocumentData)
  }

  @Action
  removeGroup(snapshot: firebase.firestore.QueryDocumentSnapshot) {
    this.REMOVE_GROUP({
      ...snapshot.data(),
      id: snapshot.id
    } as IGroupDocumentData)
  }
}
