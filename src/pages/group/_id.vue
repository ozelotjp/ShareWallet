<template>
  <v-container>
    <v-row v-if="ready && ready2">
      <v-col xl="6" cols="12">
        <transactions-table :group-id="groupId" />
      </v-col>
      <v-col xl="6" cols="12">
        <users-table :group-id="groupId" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import TransactionsTable from '@/components/TransactionsTable.vue'
import UsersTable from '@/components/UsersTable.vue'
import { groupStore } from '@/store'

export default defineComponent({
  middleware: 'authenticated',
  components: {
    TransactionsTable,
    UsersTable
  },
  setup(_, { root: { $nuxt, $route } }) {
    const ready = computed(() => groupStore.ready)
    const ready2 = ref(false)
    const groupId = $route.params.id

    if (ready.value === true) {
      if (typeof groupStore.group[groupId] === 'undefined') {
        $nuxt.error({
          statusCode: 404,
          message: 'グループがありませんでした'
        })
        return
      }
      ready2.value = true
    }

    return {
      ready,
      ready2,
      groupId
    }
  }
})
</script>
