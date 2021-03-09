<template>
    <div class="bg-light border-right" id="sidebar-wrapper">
      <div class="sidebar-heading">relavis</div>
      <div class="list-group list-group-flush">
        <button class="list-group-item list-group-item-action bg-light" :key="i" v-for="(c, i) in sidebar" @click="setActiveComponent(i)">{{c}}</button>
      </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({
  methods: {
    setActiveComponent (n: number) {
      this.$store.commit('setActiveComponent', { n: n })
    }
  },
  props: {
  }
})
export default class SidebarComponent extends Vue {
  data () {
    return {
      sidebar: [
        'Search results',
        'Family tree',
        'Nothing',
        'Nothing',
        'Nothing'
      ]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
