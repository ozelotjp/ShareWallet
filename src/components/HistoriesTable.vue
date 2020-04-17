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
  </v-card>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import { IGroupDocumentData } from '../../models/GroupDocument'
import { IGroupHistoryDocumentData } from '../../models/GroupHistoryDocument'
import { convertTimestampToDateFormat } from '../utils/format-data'

export default defineComponent({
  setup(_, { root: { $firebase }, emit }) {
    const show = ref(false)

    const group = ref({} as IGroupDocumentData)
    const histories = ref([] as IGroupHistoryDocumentData[])

    const open = (
      _group: IGroupDocumentData,
      _histories: IGroupHistoryDocumentData[]
    ) => {
      group.value = _group
      histories.value = _histories
      show.value = true
    }

    interface IHistoriesTableItems {
      id: string
      createdAt: string
      title: string
      diff: number | undefined
      wallet: number | undefined
    }
    const table = computed(() => {
      const myUid = $firebase.auth().currentUser!.uid
      const wallet = group.value.users[myUid].wallet
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

    const showHistoryDialog = (historyId: string) => {
      emit('clickHistoryDialogBtn', historyId)
    }
    const showAddTransactionDialog = () => {
      emit('clickAddTransactionDialogBtn')
    }

    return {
      show,
      open,
      table,
      showHistoryDialog,
      showAddTransactionDialog
    }
  }
})
</script>
