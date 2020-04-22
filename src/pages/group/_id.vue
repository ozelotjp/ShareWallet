<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <histories-table v-if="ready" :group-id="groupId" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import HistoriesTable from '@/components/HistoriesTable.vue'
import { groupStore } from '@/store'

export default defineComponent({
  middleware: 'authenticated',
  components: {
    HistoriesTable
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
