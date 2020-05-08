<template>
  <v-dialog v-model="show" max-width="512">
    <v-card>
      <v-card-title>
        招待用のリンクを作成
      </v-card-title>
      <v-card-text>
        <v-select
          v-model="role"
          :items="['読み書き', '閲覧のみ']"
          label="権限"
          prepend-inner-icon="mdi-account"
          outlined
        />
        <v-checkbox v-model="permanent" label="何度でも使えるようにする" />
      </v-card-text>
      <v-card-actions>
        <v-col cols="6">
          <v-btn block @click="show = false">
            キャンセル
          </v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn :loading="loading" color="primary" block @click="createInvite">
            作成
          </v-btn>
        </v-col>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { IRoleName } from '@@/models/Role'
import { convertRoleKeyFromName } from '@/utils/role'

export default defineComponent({
  setup(_, { root: { $firebase }, emit }) {
    const show = ref(false)
    const loading = ref(false)

    const groupId = ref('')
    const role = ref('' as IRoleName)
    const permanent = ref(false)

    const open = (_groupId: string) => {
      show.value = true
      loading.value = false
      groupId.value = _groupId
      role.value = '閲覧のみ'
      permanent.value = false
    }

    const createInvite = () => {
      loading.value = true
      $firebase
        .firestore()
        .collection('group')
        .doc(groupId.value)
        .collection('invite')
        .add({
          role: convertRoleKeyFromName(role.value),
          permanent: permanent.value
        })
        .then(() => {
          emit('update')
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
      role,
      permanent,
      open,
      createInvite
    }
  }
})
</script>
