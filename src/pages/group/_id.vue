<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <histories-table
          ref="historiesTable"
          @clickHistoryDialogBtn="showHistoryDialog"
          @clickAddTransactionDialogBtn="showAddTransactionDialog"
        />
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
import { defineComponent, reactive, ref } from '@vue/composition-api'
import { IGroupDocumentData } from '@@/models/GroupDocument'
import { IGroupHistoryDocumentData } from '@@/models/GroupHistoryDocument'
import HistoriesTable from '@/components/HistoriesTable.vue'
import HistoryDialog from '@/components/HistoryDialog.vue'
import AddTransactionDialog from '@/components/AddTransactionDialog.vue'

export default defineComponent({
  middleware: 'authenticated',
  components: {
    HistoriesTable,
    HistoryDialog,
    AddTransactionDialog
  },
  setup(_, { root: { $firebase, $route } }) {
    const show = ref(false)

    const group = reactive({} as IGroupDocumentData)
    const histories = ref([] as IGroupHistoryDocumentData[])

    const historiesTable = ref() as any
    const showHistoriesTable = () => {
      historiesTable.value.open(group, histories.value)
    }

    const historyDialog = ref() as any
    const showHistoryDialog = (historyId: string) => {
      const history = histories.value.filter(
        (history) => history.id === historyId
      )[0]
      historyDialog.value.open(group, history)
    }

    const addTransactionDialog = ref() as any
    const showAddTransactionDialog = () => {
      addTransactionDialog.value.open(group.id, group.users)
    }

    const updateGroupState = () => {
      const groupId = $route.params.id
      show.value = false
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
              show.value = true
              showHistoriesTable()
            })
        })
    }
    updateGroupState()

    return {
      show,
      historiesTable,
      showHistoriesTable,
      historyDialog,
      showHistoryDialog,
      addTransactionDialog,
      showAddTransactionDialog,
      updateGroupState
    }
  }
})
</script>
