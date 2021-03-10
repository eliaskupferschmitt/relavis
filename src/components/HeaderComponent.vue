<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
    <ul class="navbar-nav ml-auto mr-auto mt-2 mt-lg-0">
      <li class="nav-item active mt-2">
        <label class="input-group">
          <input type="search" class="form-control rounded" placeholder="Search for person..." v-model="searchBar"/>
          <button type="button" class="btn btn-outline-primary" @click="search">Search</button>
          <button type="button" class="btn btn-outline-primary" @click="visualSearch">Visual Search</button>
        </label>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({
  props: {
  },
  methods: {
    search () {
      if (this.$data.searchBar.trim() !== '') {
        this.$store.commit('search', { name: this.$data.searchBar })
      }
    },
    visualSearch () {
      if (this.$data.searchBar.trim() !== '') {
        this.$store.commit('visualSearch', { name: this.$data.searchBar })
      }
    }
  }
})
export default class HeaderComponent extends Vue {
  data () {
    return {
      searchBar: ''
    }
  }
}
</script>

<style scoped>
</style>
