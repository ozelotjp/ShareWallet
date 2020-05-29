<template>
  <v-container>
    <v-row>
      <v-col
        v-for="group in groupList"
        :key="group.id"
        cols="12"
        sm="6"
        md="4"
        lg="4"
        xl="3"
      >
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
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="4" xl="3">
        <v-card color="grey lighten-1">
          <v-card-title>
            グループを作成
          </v-card-title>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="showCreateGroupDialog">
              作成
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <create-group-dialog ref="createGroupDialog" />
  </v-container>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  ref,
  Ref
} from '@vue/composition-api'
import { groupStore } from '@/store'
import CreateGroupDialog from '@/components/CreateGroupDialog.vue'

export default defineComponent({
  middleware: 'authenticated',
  components: {
    CreateGroupDialog
  },
  setup(_, { root: { $firebase } }) {
    const groupList = computed(() => groupStore.list)
    const uid = $firebase.auth().currentUser!.uid
    const group = reactive({
      name: '',
      username: ''
    })

    const createGroupDialog = ref() as Ref<any>
    const showCreateGroupDialog = () => {
      createGroupDialog.value.open()
    }

    return {
      groupList,
      uid,
      group,
      createGroupDialog,
      showCreateGroupDialog
    }
  }
})
</script>
