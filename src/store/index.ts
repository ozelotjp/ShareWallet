import { Store } from 'vuex'
import { initializeStores } from '@/utils/store-accessor.ts'
const initialaizer = (store: Store<any>) => initializeStores(store)
export const plugins = [initialaizer]
export * from '@/utils/store-accessor.ts'
