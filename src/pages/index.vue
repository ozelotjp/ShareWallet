<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-alert type="info">
          {{ message }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  setup() {
    const message = 'Hello Developer'

    return {
      message
    }
  }
})
</script>
