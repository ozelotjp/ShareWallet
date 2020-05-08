<template>
  <v-dialog v-model="show" max-width="512">
    <v-card>
      <v-card-title>
        詳細
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="user.name"
          label="名前"
          prepend-inner-icon="mdi-account"
          outlined
        />
        <v-select
          v-model="user.role"
          :items="['管理者', '読み書き', '閲覧のみ', '無効']"
          label="権限"
          prepend-inner-icon="mdi-account"
          outlined
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="show = false">
          取り消し
        </v-btn>
        <v-btn :loading="loading" color="primary" @click="update">
          更新
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from '@vue/composition-api'
import { IRoleName, IRoleKey } from '@@/models/Role'
import { IUpdateUser } from '@@/models/UpdateUser'
import { convertRoleNameFromKey, convertRoleKeyFromName } from '@/utils/role'

export default defineComponent({
  setup(_, { root: { $firebase } }) {
    const show = ref(false)
    const loading = ref(false)

    const groupId = ref('')
    const user = reactive({
      id: '',
      name: '',
      role: '' as IRoleName
    })

    const open = (
      _groupId: string,
      _user: {
        id: string
        name: string
        role: IRoleKey
        wallet: number
      }
    ) => {
      groupId.value = _groupId
      user.id = _user.id
      user.name = _user.name
      user.role = convertRoleNameFromKey(_user.role)
      show.value = true
      loading.value = false
    }
    const update = () => {
      loading.value = true
      $firebase
        .app()
        .functions('asia-northeast1')
        .httpsCallable('updateUser')({
          group: groupId.value,
          user: {
            id: user.id,
            name: user.name,
            role: convertRoleKeyFromName(user.role)
          }
        } as IUpdateUser)
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

    return {
      show,
      loading,
      user,
      open,
      update
    }
  }
})
</script>
