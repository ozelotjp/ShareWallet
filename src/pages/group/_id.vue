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
                <v-btn @click="showAddTransactionDialog()">
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
    <v-dialog
      v-if="historyDialogModal"
      v-model="historyDialogModal"
      max-width="512"
    >
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
            :value="group.users[historyDialog.author].name"
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
              <tr v-for="user in historyDialog.users" :key="user.uid">
                <td>
                  {{ group.users[user.uid].name }}
                </td>
                <td>
                  <v-chip :color="user.diff >= 0 ? 'green' : 'red'" dark>
                    {{ user.diff >= 0 ? '+' : '' }}{{ user.diff }}
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
    <v-dialog
      v-if="addTransactionDialogModal"
      v-model="addTransactionDialogModal"
      max-width="512"
    >
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
            v-model="addTransactionDialog.title"
            label="取引内容"
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
              <tr v-for="user in addTransactionDialog.users" :key="user.uid">
                <td>
                  {{ group.users[user.uid].name }}
                </td>
                <td>
                  <v-text-field
                    v-model="user.diff"
                    append-icon="mdi-currency-jpy"
                    style="max-width: 150px;"
                    reverse
                  >
                    0
                  </v-text-field>
                </td>
                <td>
                  <v-btn @click="adjustDifference(user.uid)">
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
          <v-btn
            :loading="addTransactionDialogLoading"
            @click="addTransaction()"
          >
            取引を追加
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from '@vue/composition-api'
import { IAddTransaction } from '@@/models/AddTransaction'
import { IGroupDocumentData } from '@@/models/GroupDocument'
import { IGroupHistoryDocumentData } from '@@/models/GroupHistoryDocument'
import {
  convertTimestampToDateFormat,
  convertTimestampToDateTimeFormat
} from '@/utils/format-data'

export default defineComponent({
  middleware: 'authenticated',
  setup(_, { root: { $firebase, $route } }) {
    // general
    const hitoryId = $route.params.id
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
        .doc(hitoryId)
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
        .doc(hitoryId)
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
    const historyDialog = reactive({
      id: '',
      author: '',
      createdAt: '',
      title: '',
      users: [] as {
        uid: string
        diff: number
        wallet: number
      }[]
    })
    const historyDialogModal = ref(false)
    const showHistoryDialog = (id: string) => {
      const history = histories.value.filter((history) => history.id === id)[0]
      historyDialog.id = history.id
      historyDialog.author = history.author
      historyDialog.createdAt = convertTimestampToDateTimeFormat(
        history.createdAt
      )
      historyDialog.title = history.title
      historyDialog.users = []
      Object.keys(history.users).forEach((uid) => {
        historyDialog.users.push({
          uid,
          diff: history.users[uid].diff,
          wallet: history.users[uid].wallet
        })
      })
      historyDialogModal.value = true
    }

    // add transaction dialog
    const addTransactionDialog = reactive({
      title: '',
      users: [] as {
        uid: string
        diff: string
      }[]
    })
    const addTransactionDialogModal = ref(false)
    const addTransactionDialogLoading = ref(false)
    const showAddTransactionDialog = () => {
      addTransactionDialog.title = ''
      addTransactionDialog.users = []
      Object.keys(group.users).forEach((key) => {
        addTransactionDialog.users.push({
          uid: key,
          diff: ''
        })
      })
      addTransactionDialogModal.value = true
    }
    const adjustDifference = (uid: string) => {
      const user = addTransactionDialog.users.filter(
        (user) => user.uid === uid
      )[0]
      user.diff = addTransactionDialog.users
        .filter((user) => user.uid !== uid)
        .reduce((total, user) => total - Number(user.diff), 0)
        .toString()
    }
    const addTransaction = () => {
      const users = {} as {
        [uid: string]: {
          diff: number
        }
      }
      addTransactionDialog.users.forEach((user) => {
        if (Number(user.diff) === 0) {
          return
        }
        users[user.uid] = {
          diff: Number(user.diff)
        }
      })
      // check non-numeric & zero (consistency)
      if (
        Object.keys(users).reduce(
          (total, uid) => total + users[uid].diff,
          0
        ) !== 0
      ) {
        window.alert('金額の差が0になるように修正してください。')
        return
      }
      // continue
      addTransactionDialogLoading.value = true
      $firebase
        .app()
        .functions('asia-northeast1')
        .httpsCallable('addTransaction')({
          group: group.id,
          title: addTransactionDialog.title,
          users
        } as IAddTransaction)
        .then((response) => console.log(response))
        .catch((error) => console.error(error))
        .finally(() => {
          updateGroupState()
          addTransactionDialogLoading.value = false
          addTransactionDialogModal.value = false
        })
    }

    return {
      myUid,
      ready,
      group,
      historiesTable,
      historyDialog,
      historyDialogModal,
      showHistoryDialog,
      addTransactionDialog,
      addTransactionDialogModal,
      addTransactionDialogLoading,
      showAddTransactionDialog,
      adjustDifference,
      addTransaction
    }
  }
})
</script>
