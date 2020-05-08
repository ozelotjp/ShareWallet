<template>
  <v-dialog v-model="show" max-width="512">
    <v-card>
      <v-card-title>
        詳細
      </v-card-title>
      <v-card-text>
        <v-text-field
          label="日時"
          :value="input.createdAt"
          prepend-inner-icon="mdi-calendar"
          outlined
          readonly
        />
        <v-text-field
          label="取引内容"
          :value="input.title"
          prepend-inner-icon="mdi-text"
          outlined
          readonly
        />
        <v-text-field
          label="作成者"
          :value="input.author"
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
            <tr v-for="user in input.users" :key="user.uid">
              <td>
                {{ user.name }}
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
        <v-btn
          v-if="['admin', 'write'].includes(myRole)"
          @click="duplicateTransaction"
        >
          複製
        </v-btn>
        <v-btn
          v-if="['admin', 'write'].includes(myRole)"
          :loading="loading"
          @click="revertTransaction"
        >
          取り消し
        </v-btn>
        <v-spacer />
        <v-btn color="primary" @click="show = false">
          閉じる
        </v-btn>
      </v-card-actions>
    </v-card>
    <add-transaction-dialog ref="addTransactionDialog" />
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, Ref } from '@vue/composition-api'
import { IGroupTransactionDocumentData } from '@@/models/GroupTransactionDocument'
import { IRevertTransaction } from '@@/models/RevertTransaction'
import { compareAlphabet } from '@/utils/compareAlphabet'
import { convertTimestampToDateTimeFormat } from '@/utils/format-data'
import { groupStore } from '@/store'
import AddTransactionDialog from '@/components/AddTransactionDialog.vue'

export default defineComponent({
  components: {
    AddTransactionDialog
  },
  setup(_, { root: { $firebase } }) {
    const show = ref(false)
    const loading = ref(false)
    const myRole = ref('')
    const input = reactive({
      group: '',
      id: '',
      author: '',
      createdAt: '',
      title: '',
      users: [] as {
        uid: string
        name: string
        diff: number
        wallet: number
      }[]
    })

    const open = (
      groupId: string,
      transaction: IGroupTransactionDocumentData
    ) => {
      const group = groupStore.group[groupId]
      myRole.value = group.users[$firebase.auth().currentUser!.uid].role
      input.group = groupId
      input.id = transaction.id
      input.author = group.users[transaction.author].name
      input.createdAt = convertTimestampToDateTimeFormat(transaction.createdAt)
      input.title = transaction.title
      input.users = []
      Object.keys(transaction.users).forEach((uid) => {
        input.users.push({
          uid,
          name: group.users[uid].name,
          diff: transaction.users[uid].diff,
          wallet: transaction.users[uid].wallet
        })
      })
      input.users.sort((a, b) => compareAlphabet(a.name, b.name))
      show.value = true
      loading.value = false
    }

    const addTransactionDialog = ref({}) as Ref<any>
    const duplicateTransaction = () => {
      const users = {} as { [uid: string]: { diff: number } }
      input.users.forEach((user) => {
        users[user.uid] = {
          diff: user.diff
        }
      })
      addTransactionDialog.value.open(input.group, {
        title: input.title,
        users
      })
    }

    const revertTransaction = () => {
      if (
        window.confirm(
          'この取引を取り消してもよろしいですか？\nこの操作はもとに戻せません。'
        ) === true
      ) {
        loading.value = true
        $firebase
          .app()
          .functions('asia-northeast1')
          .httpsCallable('revertTransaction')({
            group: input.group,
            transaction: input.id
          } as IRevertTransaction)
          .then(() => {
            show.value = false
          })
          .catch((error) => {
            console.error({ error })
          })
          .finally(() => {
            loading.value = false
          })
      }
    }

    return {
      show,
      loading,
      myRole,
      input,
      open,
      addTransactionDialog,
      duplicateTransaction,
      revertTransaction
    }
  }
})
</script>
