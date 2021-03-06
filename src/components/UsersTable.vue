<template>
  <v-card>
    <v-card-title>
      ユーザ一覧
      <v-spacer />
      <v-btn v-if="['admin'].includes(myRole)" @click="showInviteDialog">
        招待
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-simple-table>
        <thead>
          <tr>
            <th>名前</th>
            <th>残高</th>
            <th>権限</th>
            <th v-if="['admin'].includes(myRole)" style="width: 1%;">
              <!-- actions -->
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.wallet }}</td>
            <td>{{ convertRoleNameFromKey(user.role) }}</td>
            <td v-if="['admin'].includes(myRole)">
              <v-btn @click="showUserDialog(user)">
                編集
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card-text>
    <user-dialog ref="userDialog" />
    <invite-dialog ref="inviteDialog" />
  </v-card>
</template>

<script lang="ts">
import { defineComponent, computed, ref, Ref } from '@vue/composition-api'
import { IRoleKey } from '@@/models/Role'
import { compareAlphabet } from '@/utils/compareAlphabet'
import { groupStore } from '@/store'
import { convertRoleNameFromKey } from '@/utils/role'
import UserDialog from '@/components/UserDialog.vue'
import InviteDialog from '@/components/InviteDialog.vue'

interface IProps {
  groupId: string
}

interface User {
  id: string
  name: string
  role: IRoleKey
  wallet: number
}

export default defineComponent({
  components: {
    UserDialog,
    InviteDialog
  },
  props: {
    groupId: {
      type: String,
      required: true
    }
  },
  setup(props: IProps, { root: { $firebase } }) {
    const users = computed(() => {
      const group = groupStore.group[props.groupId]
      const role = ['admin', 'write', 'read', 'invalid']
      return Object.keys(group.users)
        .map((id) => {
          return { ...group.users[id], id }
        })
        .sort((a, b) => {
          const x = role.indexOf(a.role) - role.indexOf(b.role)
          const y = compareAlphabet(a.name, b.name)
          return x !== 0 ? x : y
        }) as User[]
    })
    const myRole = computed(() => {
      return users.value.filter(
        (user) => user.id === $firebase.auth().currentUser!.uid
      )[0].role
    })

    const userDialog = ref() as Ref<any>
    const showUserDialog = (user: User) => {
      userDialog.value.open(props.groupId, user)
    }

    const inviteDialog = ref() as Ref<any>
    const showInviteDialog = () => {
      inviteDialog.value.open(props.groupId)
    }

    return {
      users,
      myRole,
      convertRoleNameFromKey,
      userDialog,
      showUserDialog,
      inviteDialog,
      showInviteDialog
    }
  }
})
</script>
