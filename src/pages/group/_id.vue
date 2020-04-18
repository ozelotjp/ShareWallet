<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <histories-table :group-id="groupId" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import HistoriesTable from '@/components/HistoriesTable.vue'

export default defineComponent({
  middleware: 'authenticated',
  components: {
    HistoriesTable
  },
  setup(_, { root: { $route } }) {
    const groupId = $route.params.id

    return {
      groupId
    }
  }
})
</script>
