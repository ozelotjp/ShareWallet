<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-alert type="error">
          {{ message }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

interface IProps {
  error: {
    statusCode: number
    message?: string
    string?: string
  }
}

export default defineComponent({
  props: {
    error: {
      type: Object,
      required: true
    }
  },
  setup(props: IProps) {
    const message = (() => {
      if (typeof props.error.message !== 'undefined') {
        return props.error.message
      }
      switch (props.error.statusCode) {
        case 404:
          return 'ページがありません'
        default:
          return '何らかのエラーが発生しました'
      }
    })()

    return {
      message
    }
  }
})
</script>
