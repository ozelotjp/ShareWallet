import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import IWallet from '~/models/Wallet'

@Module({ stateFactory: true, namespaced: true, name: 'wallet' })
export default class Wallet extends VuexModule {
  current = '' as string
  list = [] as IWallet[]

  get getCurrentWallet(): IWallet {
    return this.list.filter((wallet: IWallet) => wallet.id === this.current)[0]
  }

  @Mutation
  setCurrent(id: string) {
    this.current = id
  }

  @Action
  selectWallet(id: string) {
    this.setCurrent(id)
  }
}
