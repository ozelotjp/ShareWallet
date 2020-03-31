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
                  残高：{{ group.users[uid].wallet }}円
                </v-toolbar-title>
                <v-spacer />
                <v-btn @click="showAddTransactionDialog()">
                  取引を追加
                </v-btn>
              </v-toolbar>
            </template>
            <template v-slot:item.change="{ item }">
              <v-chip :color="item.change >= 0 ? 'green' : 'red'" dark>
                {{ item.change >= 0 ? '+' : '' }}{{ item.change }}
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
    <v-dialog v-model="historyDialogModal" max-width="512">
      <v-card>
        <v-card-title>
          詳細
        </v-card-title>
        <v-card-text>
          <v-text-field
            label="日時"
            :value="historyDialog.createdAt"
            prepend-inner-icon="mdi-calendar"
            outlined
            readonly
          />
          <v-text-field
            label="取引内容"
            :value="historyDialog.title"
            prepend-inner-icon="mdi-text"
            outlined
            readonly
          />
          <v-text-field
            label="作成者"
            :value="historyDialog.author"
            prepend-inner-icon="mdi-account"
            outlined
            readonly
          />
          <v-simple-table>
            <thead>
              <tr>
                <th>
                  名前
                </th>
                <th>
                  金額
                </th>
                <th>
                  差引残高
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in historyDialog.users" :key="user.id">
                <td>
                  {{ user.name }}
                </td>
                <td>
                  <v-chip :color="user.change >= 0 ? 'green' : 'red'" dark>
                    {{ user.change >= 0 ? '+' : '' }}{{ user.change }}
                  </v-chip>
                </td>
                <td>
                  {{ user.wallet }}
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn disabled>
            取り消し
          </v-btn>
          <v-btn @click="historyDialogModal = false">
            閉じる
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="addTransactionDialogModal" max-width="512">
      <v-card>
        <v-card-title>
          取引を追加
          <v-spacer />
          <v-btn disabled>
            テンプレート
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field
            label="取引内容"
            :value="addTransactionDialog.title"
            prepend-inner-icon="mdi-text"
            outlined
            placeholder="昼飯代など"
          />
          <v-simple-table>
            <thead>
              <tr>
                <th>
                  名前
                </th>
                <th>
                  金額
                </th>
                <th>
                  <!-- Action -->
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in addTransactionDialog.users" :key="user.id">
                <td>
                  {{ user.name }}
                </td>
                <td>
                  <v-text-field
                    v-model="user.change"
                    append-icon="mdi-currency-jpy"
                    style="max-width: 150px"
                    reverse
                  >
                    0
                  </v-text-field>
                </td>
                <td>
                  <v-btn @click="adjustDifference(user.id)">
                    差額調整
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="addTransactionDialogModal = false">
            キャンセル
          </v-btn>
          <v-btn @click="addTransaction()">
            取引を追加
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from '@vue/composition-api'
import { IGroupHistoryDocumentData, IGroupDocumentData } from '@/models/Group'
import {
  convertTimestampToDateFormat,
  convertTimestampToDateTimeFormat
} from '@/utils/format-data'

export default defineComponent({
  middleware: 'authenticated',
  setup(_, { root: { $firebase, $route } }) {
    const id = $route.params.id
    const uid = $firebase.auth().currentUser!.uid
    const ready = reactive({
      wallet: false
    })

    const group = reactive({} as IGroupDocumentData)
    $firebase
      .firestore()
      .collection('group')
      .doc(id)
      .get()
      .then((document) => {
        const groupDocument = Object.assign(document.data(), {
          id: document.id
        }) as IGroupDocumentData
        group.id = groupDocument.id
        group.title = groupDocument.title
        group.updatedAt = groupDocument.updatedAt
        group.users = groupDocument.users
        ready.wallet = true
      })

    const histories = ref([] as IGroupHistoryDocumentData[])
    $firebase
      .firestore()
      .collection('group')
      .doc(id)
      .collection('histories')
      .orderBy('createdAt', 'desc')
      .get()
      .then((documentsQuery) => {
        documentsQuery.docs.forEach((document) => {
          histories.value.push(
            Object.assign(document.data(), {
              id: document.id
            }) as IGroupHistoryDocumentData
          )
        })
      })

    interface IHistoriesTableItems {
      id: string
      createdAt: string
      title: string
      change: number
      wallet: number
    }
    const historiesTable = computed(() => {
      const headers = [
        { text: '日付', value: 'createdAt' },
        { text: '取引内容', value: 'title' },
        { text: '金額', value: 'change' },
        { text: '差引残高', value: 'wallet' },
        { value: 'actions', width: '1%' }
      ]
      const items = [] as IHistoriesTableItems[]
      histories.value.forEach((history) => {
        items.push({
          id: history.id,
          createdAt: convertTimestampToDateFormat(history.createdAt),
          title: history.title,
          change: history.users[uid].change,
          wallet: history.users[uid].wallet
        })
      })
      return {
        headers,
        items
      }
    })

    const historyDialog = reactive({
      id: '',
      author: '',
      createdAt: '',
      title: '',
      users: [] as {
        id: string
        name: string
        change: number
        wallet: number
      }[]
    })
    const historyDialogModal = ref(false)
    const showHistoryDialog = (id: string) => {
      const history = histories.value.filter((history) => history.id === id)[0]
      historyDialog.id = history.id
      historyDialog.author = group.users[history.author].name
      historyDialog.createdAt = convertTimestampToDateTimeFormat(
        history.createdAt
      )
      historyDialog.title = history.title
      historyDialog.users = []
      Object.keys(history.users).forEach((key) => {
        historyDialog.users.push({
          id: key,
          name: group.users[key].name,
          change: history.users[key].change,
          wallet: history.users[key].wallet
        })
      })
      historyDialogModal.value = true
    }

    const addTransactionDialog = reactive({
      title: '',
      users: [] as {
        id: string
        name: string
        change: string
      }[]
    })
    const addTransactionDialogModal = ref(false)
    const showAddTransactionDialog = () => {
      addTransactionDialog.title = ''
      addTransactionDialog.users = []
      Object.keys(group.users).forEach((key) => {
        addTransactionDialog.users.push({
          id: key,
          name: group.users[key].name,
          change: ''
        })
      })
      addTransactionDialogModal.value = true
    }
    const adjustDifference = (id: string) => {
      const user = addTransactionDialog.users.filter(
        (user) => user.id === id
      )[0]
      user.change = addTransactionDialog.users
        .filter((user) => user.id !== id)
        .reduce((total, user) => total - Number(user.change), 0)
        .toString()
    }
    const addTransaction = () => {
      if (
        addTransactionDialog.users.reduce(
          (total, user) => total + Number(user.change),
          0
        ) !== 0
      ) {
        window.alert('金額の差が0になるように修正してください。')
        return
      }
      window.alert('ok')
    }

    return {
      uid,
      ready,
      group,
      historiesTable,
      historyDialog,
      historyDialogModal,
      showHistoryDialog,
      addTransactionDialog,
      addTransactionDialogModal,
      showAddTransactionDialog,
      adjustDifference,
      addTransaction
    }
  }
})
</script>
