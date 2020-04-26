<template>
  <v-container>
    <v-row v-if="ready">
      <v-col xl="6" cols="12">
        <histories-table :group-id="groupId" />
      </v-col>
      <v-col xl="6" cols="12">
        <users-table :group-id="groupId" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import HistoriesTable from '@/components/HistoriesTable.vue'
import UsersTable from '@/components/UsersTable.vue'
import { groupStore } from '@/store'

export default defineComponent({
  middleware: 'authenticated',
  components: {
    HistoriesTable,
    UsersTable
  },
  setup(_, { root: { $route } }) {
    const ready = computed(() => groupStore.ready)
    const groupId = $route.params.id

    return {
      ready,
      groupId
    }
  }
})
</script>
