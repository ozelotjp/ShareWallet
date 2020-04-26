<template>
  <v-dialog v-model="show" max-width="512">
    <v-card>
      <v-card-title>
        招待
      </v-card-title>
      <v-card-text>
        <v-text-field
          label="権限"
          :value="convertRoleNameFromKey(inviteRole)"
          prepend-inner-icon="mdi-account"
          outlined
          readonly
        />
        <v-text-field
          id="invite-url"
          label="URL（クリックでコピー）"
          :value="inviteUrl"
          outlined
          readonly
          hint="コピーしました"
          @click="copyInviteUrl"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="show = false">
          閉じる
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from '@vue/composition-api'
import { IRoleKey } from '@@/models/Role'
import { convertRoleNameFromKey } from '@/utils/role'
import CreateInviteDialog from '@/components/CreateInviteDialog.vue'

export default defineComponent({
  components: {
    CreateInviteDialog
  },
  setup() {
    const show = ref(false)

    const groupId = ref('')
    const inviteId = ref('')
    const inviteRole = ref('' as IRoleKey)

    const inviteUrl = computed(() => {
      return `${location.protocol}//${location.host}/invite/${groupId.value}/${inviteId.value}`
    })

    const open = (_groupId: string, invite: { id: string; role: IRoleKey }) => {
      groupId.value = _groupId
      inviteId.value = invite.id
      inviteRole.value = invite.role
      show.value = true
    }

    const copyInviteUrl = () => {
      const element = document.querySelector('#invite-url') as HTMLInputElement
      element.select()
      document.execCommand('copy')
    }

    return {
      show,
      inviteRole,
      inviteUrl,
      open,
      convertRoleNameFromKey,
      copyInviteUrl
    }
  }
})
</script>
