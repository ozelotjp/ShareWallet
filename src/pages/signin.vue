<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-alert type="info">
          しばらくお待ち下さい
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { authenticatedStore } from '../store'

export default defineComponent({
  setup(_, { root: { $firebase, $router } }) {
    $firebase.auth().onAuthStateChanged((user) => {
      if (user === null) {
        signInWithGoogle()
        return
      }
      $router.push(authenticatedStore.nextUrl || '/')
    })

    function signInWithGoogle() {
      $firebase
        .auth()
        .signInWithRedirect(new $firebase.auth.GoogleAuthProvider())
    }
  }
})
</script>
