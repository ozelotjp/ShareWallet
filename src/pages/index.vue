<template>
  <v-container>
    <v-row>
      <v-col v-for="group in groupList" :key="group.id" cols="4">
        <v-card>
          <v-card-title>
                {{ group.title }}
          </v-card-title>
          <v-card-subtitle>
                残高： {{ group.users[uid].wallet }}円
          </v-card-subtitle>
          <v-card-actions>
            <v-spacer />
            <v-btn :to="'/group/' + group.id">
              詳細
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { groupStore } from '@/store'

export default defineComponent({
  middleware: 'authenticated',
  setup(_, { root: { $firebase } }) {
    const groupList = computed(() => groupStore.list)
    const uid = $firebase.auth().currentUser!.uid

    return {
      groupList,
      uid
    }
  }
})
</script>
