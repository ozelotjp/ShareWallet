<template>
  <v-dialog v-model="show" max-width="512">
    <v-card>
      <v-card-title>
        取引を追加
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="input.title"
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
            <tr v-for="user in input.users" :key="user.uid">
              <td>
                {{ user.name }}
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
        <v-col cols="6">
          <v-btn block @click="show = false">
            キャンセル
          </v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn
            :loading="loading"
            color="primary"
            block
            @click="addTransaction"
          >
            取引を追加
          </v-btn>
        </v-col>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from '@vue/composition-api'
import { IAddTransaction } from '@@/models/AddTransaction'
import { compareAlphabet } from '@/utils/compareAlphabet'
import { groupStore } from '@/store'

export default defineComponent({
  setup(_, { root: { $firebase }, emit }) {
    const show = ref(false)
    const loading = ref(false)
    const input = reactive({
      group: '',
      title: '',
      users: [] as { uid: string; name: string; diff: string }[]
    })

    const open = (
      group: string,
      initialize?: { title: string; users: { [uid: string]: { diff: number } } }
    ) => {
      // reset
      loading.value = false
      input.group = group
      input.title = initialize?.title || ''
      input.users = []
      // initialize users
      const users = groupStore.group[group].users
      Object.keys(users).forEach((uid) => {
        if (groupStore.group[group].users[uid].role === 'invalid') {
          return
        }
        input.users.push({
          uid,
          name: users[uid].name,
          diff: initialize?.users[uid].diff.toString() || '0'
        })
      })
      input.users.sort((a, b) => compareAlphabet(a.name, b.name))
      // show
      show.value = true
    }

    const adjustDifference = (uid: string) => {
      const diff = input.users
        .filter((user) => user.uid !== uid)
        .reduce((total, user) => total - Number(user.diff), 0)
        .toString()
      input.users.filter((user) => user.uid === uid)[0].diff = diff
    }
    const addTransaction = () => {
      const users = {} as { [uid: string]: { diff: number } }
      input.users.forEach((user) => {
        if (Number(user.diff) === 0) {
          return
        }
        users[user.uid] = { diff: Number(user.diff) }
      })
      // check title
      if (input.title === '') {
        window.alert('取引内容を入力してください。')
        return
      }
      // check users
      if (Object.keys(users).length === 0) {
        window.alert('金額を入力してください。')
        return
      }
      // check non-numeric & zero (consistency)
      if (Object.keys(users).reduce((i, uid) => i + users[uid].diff, 0) !== 0) {
        window.alert('金額の差が0になるように修正してください。')
        return
      }
      // continue
      loading.value = true
      $firebase
        .app()
        .functions('asia-northeast1')
        .httpsCallable('addTransaction')({
          group: input.group,
          title: input.title,
          users
        } as IAddTransaction)
        .then(() => {
          show.value = false
          emit('added')
        })
        .catch((error: any) => {
          console.error({ error })
        })
        .finally(() => {
          loading.value = false
        })
    }

    return {
      show,
      loading,
      input,
      open,
      adjustDifference,
      addTransaction
    }
  }
})
</script>
