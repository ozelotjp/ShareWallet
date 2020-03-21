import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import Group from '@/store/group'
import Authenticated from '@/store/authenticated'

/* eslint-disable import/no-mutable-exports */
let groupStore: Group
let authenticatedStore: Authenticated
/* eslint-enable */

function initializeStores(store: Store<any>): void {
  groupStore = getModule(Group, store)
  authenticatedStore = getModule(Authenticated, store)
}

export { initializeStores, groupStore, authenticatedStore }
