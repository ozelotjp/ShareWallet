<template>
  <v-card>
    <v-data-table
      :headers="table.headers"
      :items="table.items"
      disable-sort
      :footer-props="{
        showFirstLastPage: true,
        firstIcon: 'mdi-arrow-collapse-left',
        prevIcon: 'mdi-arrow-left',
        nextIcon: 'mdi-arrow-right',
        lastIcon: 'mdi-arrow-collapse-right'
      }"
      :loading="false"
      loading-text="読込中"
      no-data-text="取引データがありません（または読み込み中）"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>残高：{{ wallet }}円</v-toolbar-title>
          <v-spacer />
          <v-btn @click="showAddTransactionDialog">
            取引を追加
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.diff="{ item }">
        <v-chip
          v-if="typeof item.diff !== 'undefined'"
          :color="item.diff >= 0 ? 'green' : 'red'"
          dark
        >
          {{ item.diff >= 0 ? '+' : '' }}{{ item.diff }}
        </v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn @click="showHistoryDialog(item.id)">
          詳細
        </v-btn>
      </template>
    </v-data-table>
    <history-dialog ref="historyDialog" />
    <add-transaction-dialog ref="addTransactionDialog" />
  </v-card>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  onBeforeUnmount,
  Ref
} from '@vue/composition-api'
import { IGroupHistoryDocumentData } from '@@/models/GroupHistoryDocument'
import { convertTimestampToDateFormat } from '@/utils/format-data'
import { groupStore } from '@/store'
import HistoryDialog from '@/components/HistoryDialog.vue'
import AddTransactionDialog from '@/components/AddTransactionDialog.vue'

export default defineComponent({
  components: {
    HistoryDialog,
    AddTransactionDialog
  },
  props: {
    groupId: {
      type: String,
      required: true
    }
  },
  setup(props, { root: { $firebase } }) {
    const unsubscribe = [] as Function[]
    onBeforeUnmount(() => {
      unsubscribe.forEach((item) => item())
    })

    const myUid = $firebase.auth().currentUser!.uid
    const group = computed(() => groupStore.group[props.groupId]).value
    const histories = ref([] as IGroupHistoryDocumentData[])
    unsubscribe.push(
      $firebase
        .firestore()
        .collection('group')
        .doc(group.id)
        .collection('histories')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
          histories.value = snapshot.docs.map((history) => {
            return {
              ...history.data(),
              id: history.id
            } as IGroupHistoryDocumentData
          })
        })
    )
    const wallet = computed(
      () => groupStore.group[props.groupId].users[myUid].wallet
    )

    interface IHistoriesTableItems {
      id: string
      createdAt: string
      title: string
      diff: number | undefined
      wallet: number | undefined
    }
    const table = computed(() => {
      const headers = [
        { text: '日付', value: 'createdAt' },
        { text: '取引内容', value: 'title' },
        { text: '金額', value: 'diff' },
        { text: '差引残高', value: 'wallet' },
        { value: 'actions', width: '1%' }
      ]
      const items = [] as IHistoriesTableItems[]
      histories.value.forEach((history) => {
        items.push({
          id: history.id,
          createdAt: convertTimestampToDateFormat(history.createdAt),
          title: history.title,
          diff: history.users[myUid]?.diff,
          wallet: history.users[myUid]?.wallet
        })
      })
      return {
        headers,
        items
      }
    })

    const historyDialog = ref() as Ref<any>
    const showHistoryDialog = (historyId: string) => {
      const history = histories.value.filter(
        (history) => history.id === historyId
      )[0]
      historyDialog.value.open(group.id, history)
    }

    const addTransactionDialog = ref() as Ref<any>
    const showAddTransactionDialog = () => {
      addTransactionDialog.value.open(group.id)
    }

    return {
      wallet,
      table,
      historyDialog,
      showAddTransactionDialog,
      addTransactionDialog,
      showHistoryDialog
    }
  }
})
</script>
