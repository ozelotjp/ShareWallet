<template>
  <v-dialog v-model="show" max-width="512">
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
            <tr v-for="(user, uid) in input.users" :key="uid">
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
                <v-btn @click="adjustDifference(uid)">
                  差額調整
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancel">
          キャンセル
        </v-btn>
        <v-btn :loading="loading" @click="addTransaction">
          取引を追加
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from '@vue/composition-api'
import { IAddTransaction } from '../../models/AddTransaction'

export default defineComponent({
  setup(_, { root: { $firebase, $set }, emit }) {
    const show = ref(false)
    const loading = ref(false)
    const input = reactive({
      group: '',
      title: '',
      users: {} as {
        [uid: string]: {
          name: string
          diff: string
        }
      }
    })

    const open = (
      group: string,
      users: { [uid: string]: { name: string } }
    ) => {
      // reset
      loading.value = false
      input.group = group
      input.title = ''
      input.users = {}
      // initialize users
      Object.keys(users).forEach((uid) => {
        $set(input.users, uid, {
          name: users[uid].name,
          diff: '0'
        })
      })
      // show
      show.value = true
    }
    const cancel = () => {
      show.value = false
    }
    const submit = () => {
      emit('submit')
      show.value = false
    }

    const adjustDifference = (uid: string) => {
      input.users[uid].diff = Object.keys(input.users)
        .filter((_uid) => _uid !== uid)
        .reduce((total, _uid) => total - Number(input.users[_uid].diff), 0)
        .toString()
    }
    const addTransaction = () => {
      const users = {} as {
        [uid: string]: {
          diff: number
        }
      }
      Object.keys(input.users).forEach((uid) => {
        const diff = Number(input.users[uid].diff)
        if (diff === 0) {
          return
        }
        users[uid] = {
          diff
        }
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
        .then((response) => {
          console.log(response)
          submit()
        })
        .catch((error: any) => {
          console.error(error)
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
      cancel,
      adjustDifference,
      addTransaction
    }
  }
})
</script>
