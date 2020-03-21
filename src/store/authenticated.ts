import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

@Module({ name: 'authenticated', namespaced: true, stateFactory: true })
export default class Authenticated extends VuexModule {
  nextUrl = null as string | null

  @Mutation
  SET_NEXT_URL(url: string) {
    this.nextUrl = url
  }

  @Action
  setNextUrl(url: string) {
    this.SET_NEXT_URL(url)
  }
}
