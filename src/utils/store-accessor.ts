import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import Group from '~/store/group'

/* eslint-disable-next-line import/no-mutable-exports */
let groupStore: Group
/* eslint-enable */

function initializeStores(store: Store<any>): void {
  groupStore = getModule(Group, store)
}

export { initializeStores, groupStore }
