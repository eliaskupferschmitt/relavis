<template>
  <div class="d-flex" id="wrapper">
    <SidebarComponent/>
    <div id="page-content-wrapper">
      <HeaderComponent/>
      <ContentComponent v-if="getActiveComponent === 0"/>
      <VisualiserComponent v-else-if="getActiveComponent === 1"/>
      <DebugDataComponent v-else-if="getActiveComponent === 2"/>
      <p v-else>There be dragons</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import SidebarComponent from './components/SidebarComponent.vue'
import HeaderComponent from './components/HeaderComponent.vue'
import ContentComponent from './components/ContentComponent.vue'
import VisualiserComponent from '@/components/VisualiserComponent.vue'
import DebugDataComponent from '@/components/DebugDataComponent.vue'

@Options({
  components: {
    SidebarComponent: SidebarComponent,
    HeaderComponent: HeaderComponent,
    ContentComponent: ContentComponent,
    VisualiserComponent: VisualiserComponent,
    DebugDataComponent: DebugDataComponent
  },
  computed: {
    getActiveComponent () {
      return this.$store.getters.activeComponent
    }
  }
})
export default class App extends Vue {}
</script>

<style>
</style>
