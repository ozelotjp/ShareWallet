<template>
  <v-card max-width="1024">
    <v-skeleton-loader v-if="show === false" type="table" />
    <v-data-table
      v-else
      :headers="table.headers"
      :items="table.items"
      disable-sort
      hide-default-footer
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title> 残高：{{ table.wallet }}円 </v-toolbar-title>
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
    <add-transaction-dialog
      ref="addTransactionDialog"
      @submit="reloadHistoriesState"
    />
  </v-card>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import { IGroupHistoryDocumentData } from '../../models/GroupHistoryDocument'
import { convertTimestampToDateFormat } from '../utils/format-data'
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
    const show = ref(false)
    const group = groupStore.group(props.groupId)
    const histories = ref([] as IGroupHistoryDocumentData[])

    const reloadHistoriesState = () => {
      show.value = false
      $firebase
        .firestore()
        .collection('group')
        .doc(group.id)
        .collection('histories')
        .orderBy('createdAt', 'desc')
        .get()
        .then((documentsQuery) => {
          histories.value = []
          documentsQuery.docs.forEach((document) => {
            histories.value.push(
              Object.assign(document.data(), {
                id: document.id
              }) as IGroupHistoryDocumentData
            )
          })
          show.value = true
        })
    }
    reloadHistoriesState()

    interface IHistoriesTableItems {
      id: string
      createdAt: string
      title: string
      diff: number | undefined
      wallet: number | undefined
    }
    const table = computed(() => {
      const myUid = $firebase.auth().currentUser!.uid
      const wallet = group.users[myUid].wallet
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
        wallet,
        headers,
        items
      }
    })

    const historyDialog = ref() as any
    const showHistoryDialog = (historyId: string) => {
      const history = histories.value.filter(
        (history) => history.id === historyId
      )[0]
      historyDialog.value.open(group.id, history)
    }

    const addTransactionDialog = ref() as any
    const showAddTransactionDialog = () => {
      addTransactionDialog.value.open(group.id, group.users)
    }

    return {
      // general
      show,
      table,
      reloadHistoriesState,
      // historyDialog
      historyDialog,
      showAddTransactionDialog,
      // addTransactionDialog
      addTransactionDialog,
      showHistoryDialog
    }
  }
})
</script>
