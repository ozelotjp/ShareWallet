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
import { createComponent } from '@vue/composition-api'

export default createComponent({
  setup() {
    const message = 'Hello Developer'

    return {
      message
    }
  }
})
</script>
