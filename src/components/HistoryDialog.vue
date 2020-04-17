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
        <v-spacer />
        <v-btn disabled>
          取り消し
        </v-btn>
        <v-btn @click="show = false">
          閉じる
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from '@vue/composition-api'
import { convertTimestampToDateTimeFormat } from '../utils/format-data'
import { IGroupDocumentData } from '../../models/GroupDocument'
import { IGroupHistoryDocumentData } from '../../models/GroupHistoryDocument'

export default defineComponent({
  setup() {
    const show = ref(false)
    const input = reactive({
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
      group: IGroupDocumentData,
      history: IGroupHistoryDocumentData
    ) => {
      input.id = history.id
      input.author = group.users[history.author].name
      input.createdAt = convertTimestampToDateTimeFormat(history.createdAt)
      input.title = history.title
      input.users = []
      Object.keys(history.users).forEach((uid) => {
        input.users.push({
          uid,
          name: group.users[uid].name,
          diff: history.users[uid].diff,
          wallet: history.users[uid].wallet
        })
      })
      input.users.sort((a, b) => {
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
        return 0
      })
      show.value = true
    }

    return {
      show,
      input,
      open
    }
  }
})
</script>
