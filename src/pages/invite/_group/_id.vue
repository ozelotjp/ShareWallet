<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card v-if="!show">
          <v-alert type="info">
            読込中です
          </v-alert>
        </v-card>
        <v-card v-if="show && typeof invite.id !== 'undefined'">
          <v-card-title>
            グループへ参加
          </v-card-title>
          <v-card-text>
            <p>
              グループで使用する名前を入力してください。
            </p>
            <v-text-field
              v-model="input"
              label="名前"
              prepend-inner-icon="mdi-account"
              outlined
            />
          </v-card-text>
          <v-card-actions>
            <v-col>
              <v-btn
                :loading="loading"
                color="primary"
                block=""
                @click="joinGroup"
              >
                参加
              </v-btn>
            </v-col>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { IGroupInviteDocumentData } from '@@/models/GroupInviteDocument'
import { IJoinGroup } from '@@/models/JoinGroup'
import { groupStore } from '@/store'

export default defineComponent({
  middleware: 'authenticated',
  setup(_, { root: { $nuxt, $firebase, $route, $router } }) {
    const show = ref(false)
    const loading = ref(false)
    const invite = ref({} as IGroupInviteDocumentData)
    const input = ref('')

    $firebase
      .firestore()
      .collection('group')
      .doc($route.params.group)
      .collection('invite')
      .doc($route.params.id)
      .get()
      .then((snapshot) => {
        if (snapshot.exists === false) {
          $nuxt.error({ statusCode: 404 })
          return
        }
        invite.value = {
          ...snapshot.data(),
          id: snapshot.id
        } as IGroupInviteDocumentData
        show.value = true
      })

    const joinGroup = () => {
      if (input.value === '') {
        window.alert('名前を入力してください。')
        return
      }
      loading.value = true
      $firebase
        .app()
        .functions('asia-northeast1')
        .httpsCallable('joinGroup')({
          group: $route.params.group,
          key: $route.params.id,
          name: input.value
        } as IJoinGroup)
        .then(() => {
          groupStore.updateReady(false)
          $router.push('/')
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
      invite,
      input,
      joinGroup
    }
  }
})
</script>
