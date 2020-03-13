import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import Wallet from '~/store/wallet'

/* eslint-disable-next-line import/no-mutable-exports */
let walletStore: Wallet
/* eslint-enable */

function initializeStores(store: Store<any>): void {
  walletStore = getModule(Wallet, store)
}

export { initializeStores, walletStore }
