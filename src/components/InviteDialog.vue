<template>
  <v-dialog v-model="show" max-width="512">
    <v-card>
      <v-card-title>
        招待
        <v-spacer />
        <v-btn @click="showCreateInviteDialog">
          リンクを作成
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-alert v-if="loading">
          データを読込中です
        </v-alert>
        <v-alert v-if="!loading && invites.length === 0" type="info">
          リンクがありません
        </v-alert>
        <v-simple-table v-if="!loading && invites.length !== 0">
          <thead>
            <tr>
              <th>権限</th>
              <th>一回限り</th>
              <th><!-- actions --></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invite in invites" :key="invite.id">
              <td>{{ convertRoleNameFromKey(invite.role) }}</td>
              <td class="text-center">
                <v-chip :color="invite.permanent ? 'red' : 'green'" dark>
                  {{ invite.permanent ? 'いいえ' : 'はい' }}
                </v-chip>
              </td>
              <td class="text-right">
                <v-btn @click="showInviteUrlDialog(invite.id, invite.role)">
                  リンクを表示
                </v-btn>
                <v-btn @click="deleteInvite(invite.id)">
                  削除
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="show = false">
          閉じる
        </v-btn>
      </v-card-actions>
    </v-card>
    <create-invite-dialog ref="createInviteDialog" @update="loadInvites" />
    <invite-url-dialog ref="inviteUrlDialog" />
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from '@vue/composition-api'
import { IGroupInviteDocumentData } from '@@/models/GroupInviteDocument'
import { IRoleKey } from '@@/models/Role'
import { convertRoleNameFromKey } from '@/utils/role'
import CreateInviteDialog from '@/components/CreateInviteDialog.vue'
import InviteUrlDialog from '@/components/InviteUrlDialog.vue'

export default defineComponent({
  components: {
    CreateInviteDialog,
    InviteUrlDialog
  },
  setup(_, { root: { $firebase } }) {
    const show = ref(false)
    const loading = ref(false)

    const groupId = ref('')
    const invites = ref([] as IGroupInviteDocumentData[])
    const loadInvites = () => {
      loading.value = true
      $firebase
        .firestore()
        .collection('group')
        .doc(groupId.value)
        .collection('invite')
        .get()
        .then((snapshot) => {
          invites.value = snapshot.docs.map((doc) => {
            return {
              ...doc.data(),
              id: doc.id
            } as IGroupInviteDocumentData
          })
          console.debug(invites.value)
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          loading.value = false
        })
    }

    const open = (_groupId: string) => {
      groupId.value = _groupId
      loadInvites()
      show.value = true
    }

    const deleteInvite = (inviteId: string) => {
      $firebase
        .firestore()
        .collection('group')
        .doc(groupId.value)
        .collection('invite')
        .doc(inviteId)
        .delete()
        .then(() => {
          window.alert('リンクを削除しました')
        })
        .catch((error) => {
          console.error(error)
        })
    }

    const createInviteDialog = ref() as Ref<any>
    const showCreateInviteDialog = () => {
      createInviteDialog.value.open(groupId.value)
    }

    const inviteUrlDialog = ref() as Ref<any>
    const showInviteUrlDialog = (id: string, role: IRoleKey) => {
      inviteUrlDialog.value.open(groupId.value, { id, role })
    }

    return {
      show,
      loading,
      groupId,
      invites,
      loadInvites,
      open,
      deleteInvite,
      createInviteDialog,
      showCreateInviteDialog,
      inviteUrlDialog,
      showInviteUrlDialog,
      convertRoleNameFromKey
    }
  }
})
</script>
