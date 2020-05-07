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
      :loading="loading"
      loading-text="取引データを読込中"
      no-data-text="取引データがありません"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>残高：{{ wallet }}円</v-toolbar-title>
          <v-spacer />
          <v-btn
            v-if="['admin', 'write'].includes(myRole)"
            @click="showAddTransactionDialog"
          >
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
        <v-btn @click="showTransactionDialog(item.id)">
          詳細
        </v-btn>
      </template>
    </v-data-table>
    <transaction-dialog ref="transactionDialog" />
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
import { IGroupTransactionDocumentData } from '@@/models/GroupTransactionDocument'
import { convertTimestampToDateFormat } from '@/utils/format-data'
import { groupStore } from '@/store'
import transactionDialog from '@/components/TransactionDialog.vue'
import AddTransactionDialog from '@/components/AddTransactionDialog.vue'

export default defineComponent({
  components: {
    transactionDialog,
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

    const loading = ref(true)
    const myUid = $firebase.auth().currentUser!.uid
    const group = computed(() => groupStore.group[props.groupId]).value
    const myRole = computed(() => group.users[myUid].role)
    const transactions = ref([] as IGroupTransactionDocumentData[])
    unsubscribe.push(
      $firebase
        .firestore()
        .collection('group')
        .doc(group.id)
        .collection('transactions')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
          transactions.value = snapshot.docs.map((transaction) => {
            return {
              ...transaction.data(),
              id: transaction.id
            } as IGroupTransactionDocumentData
          })
          loading.value = false
        })
    )
    const wallet = computed(
      () => groupStore.group[props.groupId].users[myUid].wallet
    )

    interface ITransactionsTableItems {
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
      const items = [] as ITransactionsTableItems[]
      transactions.value.forEach((transaction) => {
        items.push({
          id: transaction.id,
          createdAt: convertTimestampToDateFormat(transaction.createdAt),
          title: transaction.title,
          diff: transaction.users[myUid]?.diff,
          wallet: transaction.users[myUid]?.wallet
        })
      })
      return {
        headers,
        items
      }
    })

    const transactionDialog = ref() as Ref<any>
    const showTransactionDialog = (transactionId: string) => {
      transactionDialog.value.open(
        group.id,
        transactions.value.filter(
          (transaction) => transaction.id === transactionId
        )[0]
      )
    }

    const addTransactionDialog = ref() as Ref<any>
    const showAddTransactionDialog = () => {
      addTransactionDialog.value.open(group.id)
    }

    return {
      loading,
      myRole,
      wallet,
      table,
      transactionDialog,
      showTransactionDialog,
      showAddTransactionDialog,
      addTransactionDialog
    }
  }
})
</script>
