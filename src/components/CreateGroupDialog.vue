<template>
  <v-dialog v-model="show" max-width="512">
    <v-card>
      <v-card-title>
        グループを作成
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="group.name" label="グループ名" />
        <v-text-field v-model="group.username" label="あなたの名前" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :loading="loading" @click="createGroup">
          作成
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from '@vue/composition-api'
import { ICreateGroup } from '@@/models/CreateGroup'
import { groupStore } from '@/store'

export default defineComponent({
  setup(_, { root: { $firebase } }) {
    const show = ref(false)
    const loading = ref(false)
    const group = reactive({
      name: '',
      username: ''
    })

    const open = () => {
      show.value = true
      loading.value = false
      group.name = ''
      group.username = ''
    }

    const createGroup = () => {
      loading.value = true
      $firebase
        .app()
        .functions('asia-northeast1')
        .httpsCallable('createGroup')({
          name: group.name,
          username: group.username
        } as ICreateGroup)
        .then(() => {
          groupStore.updateReady(false)
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
      group,
      open,
      createGroup
    }
  }
})
</script>
