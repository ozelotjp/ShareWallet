<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card max-width="1024">
          <v-skeleton-loader v-if="!ready.wallet" type="table" />
          <v-data-table
            v-else
            :headers="historiesTable.headers"
            :items="historiesTable.items"
            disable-sort
            hide-default-footer
          >
            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title>
                  残高：{{ group.users[myUid].wallet }}円
                </v-toolbar-title>
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
      </v-col>
    </v-row>
    <history-dialog ref="historyDialog" />
    <add-transaction-dialog
      ref="addTransactionDialog"
      @submit="updateGroupState"
    />
  </v-container>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from '@vue/composition-api'
import { IGroupDocumentData } from '@@/models/GroupDocument'
import { IGroupHistoryDocumentData } from '@@/models/GroupHistoryDocument'
import { convertTimestampToDateFormat } from '@/utils/format-data'
import HistoryDialog from '@/components/HistoryDialog.vue'
import AddTransactionDialog from '@/components/AddTransactionDialog.vue'

export default defineComponent({
  middleware: 'authenticated',
  components: {
    HistoryDialog,
    AddTransactionDialog
  },
  setup(_, { root: { $firebase, $route } }) {
    // general
    const groupId = $route.params.id
    const myUid = $firebase.auth().currentUser!.uid
    const ready = reactive({
      wallet: false
    })

    // group, group-histories
    const group = reactive({} as IGroupDocumentData)
    const histories = ref([] as IGroupHistoryDocumentData[])
    const updateGroupState = () => {
      ready.wallet = false
      $firebase
        .firestore()
        .collection('group')
        .doc(groupId)
        .get()
        .then((document) => {
          const groupDocument = Object.assign(document.data(), {
            id: document.id
          }) as IGroupDocumentData
          group.id = groupDocument.id
          group.title = groupDocument.title
          group.updatedAt = groupDocument.updatedAt
          group.users = groupDocument.users
        })
      $firebase
        .firestore()
        .collection('group')
        .doc(groupId)
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
          ready.wallet = true
        })
    }
    updateGroupState()

    // histories table
    interface IHistoriesTableItems {
      id: string
      createdAt: string
      title: string
      diff: number | undefined
      wallet: number | undefined
    }
    const historiesTable = computed(() => {
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

    // history dialog
    const historyDialog = ref() as any
    const showHistoryDialog = (historyId: string) => {
      const history = histories.value.filter(
        (history) => history.id === historyId
      )[0]
      historyDialog.value.open(group, history)
    }

    // AddTransactionDialog
    const addTransactionDialog = ref() as any
    const showAddTransactionDialog = () => {
      addTransactionDialog.value.open(groupId, group.users)
    }

    return {
      myUid,
      ready,
      group,
      updateGroupState,
      historiesTable,
      historyDialog,
      showHistoryDialog,
      addTransactionDialog,
      showAddTransactionDialog
    }
  }
})
</script>
