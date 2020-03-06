<template>
  <v-app>
    <v-app-bar app>
      <v-icon>
        mdi-domain
      </v-icon>
      <v-toolbar-title to="/">
        ShareBank
      </v-toolbar-title>
      <v-spacer />
      <v-btn text to="/mypage">
        マイページ
      </v-btn>
    </v-app-bar>
    <v-content>
      <nuxt />
    </v-content>
  </v-app>
</template>
