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
      <v-list nav>
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
        <v-divider />
      </v-list>
      <v-list nav subheader>
        <v-subheader>
          グループ一覧
        </v-subheader>
        <v-list-item
          v-for="group in groupList"
          :key="group.id"
          :to="'/group/' + group.id"
          link
        >
          <v-list-item-icon>
            <v-icon>
              mdi-wallet
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            {{ group.title }}
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="state.drawer = !state.drawer" />
      <v-spacer />
    </v-app-bar>
    <v-content>
      <nuxt />
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { reactive, defineComponent, computed } from '@vue/composition-api'
import { groupStore } from '@/store'

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
      { icon: 'mdi-home', text: 'ホーム', to: '/' }
    ] as NavigationMenu[]
    const groupList = computed(() => groupStore.list)

    return {
      state,
      navigationMenu,
      groupList
    }
  }
})
</script>
