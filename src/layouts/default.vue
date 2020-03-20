<template>
  <v-app>
    <v-navigation-drawer v-model="state.drawer" app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>
            ShareWallet
          </v-list-item-title>
          <v-list-item-subtitle>
            ver1.0.0
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider />
      <v-list dense nav>
        <v-list-item
          v-for="(item, index) in navigationMenu"
          :key="index"
          :to="item.to"
          link
        >
          <v-list-item-icon>
            <v-icon>
              {{ item.icon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            {{ item.text }}
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="state.drawer = !state.drawer" />
      <v-spacer />
      <!--
      <v-menu offset-y bottom left>
        <template v-slot:activator="{ on }">
          <v-btn text class="text-none" v-on="on">
            {{ currentGroup.id }}
            <v-icon right>
              mdi-menu-down
            </v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="group in groupList"
            :key="group.id"
            :to="'/group/' + group.id"
          >
            <v-list-item-title>
              {{ group.id }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      -->
    </v-app-bar>
    <v-content>
      <nuxt />
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { reactive, defineComponent } from '@vue/composition-api'

interface NavigationMenu {
  icon: string
  text: string
  to: string
}

export default defineComponent({
  setup() {
    const state = reactive({
      drawer: true
    })

    const navigationMenu = [
      { icon: 'mdi-home', text: 'Home', to: '/' }
    ] as NavigationMenu[]

    return {
      state,
      navigationMenu
    }
  }
})
</script>
