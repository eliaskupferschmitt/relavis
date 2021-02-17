<template>
  <div class="d-flex" id="wrapper">
    <SidebarComponent/>
    <div id="page-content-wrapper">
      <HeaderComponent/>
      <ContentComponent/>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import SidebarComponent from './components/SidebarComponent.vue'
import HeaderComponent from './components/HeaderComponent.vue'
import ContentComponent from './components/ContentComponent.vue'

@Options({
  components: {
    SidebarComponent: SidebarComponent,
    HeaderComponent: HeaderComponent,
    ContentComponent: ContentComponent
  }
})
export default class App extends Vue {}
</script>

<style>
</style>
