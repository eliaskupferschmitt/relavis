<template>
  <div class="container-fluid">
    <table class="table table-hover mt-4" v-if="tableReady">
      <thead>
      <tr>
        <th v-for="(c, i) in tableHeader" :key="i">{{c}}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(c1, i) in table" :key="i">
        <td v-for="(c2, j) in c1" :key="j">{{c2}}</td>
      </tr>
      </tbody>
    </table>
    <h1 class="mt-4" v-else>Searching database...</h1>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({
  computed: {
    tableHeader () {
      return this.$store.getters.tableHeader
    },
    table () {
      return this.$store.getters.table
    },
    tableReady () {
      return this.$store.getters.tableReady
    }
  },
  props: {
  }
})

export default class SidebarComponent extends Vue {}
</script>

<style scoped>
</style>
