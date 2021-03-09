<template>
  <div class="container-fluid">
    <div class="container">
      <div class="row">
        <!--
      We will create a family tree using just.
      The markup will be simple nested lists
      -->
        <div class="tree">
          <ul>
            <li>
              <a href="#">Parent</a>
              <ul>
                <li>
                  <a href="#">Child</a>
                  <ul>
                    <li>
                      <a href="#">Grand Child</a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a href="#">Child</a>
                  <ul>
                    <li><a href="#">Grand Child</a></li>
                    <li>
                      <a href="#">Grand Child</a>
                      <ul>
                        <li>
                          <a href="#">Great Grand Child</a>
                        </li>
                        <li>
                          <a href="#">Great Grand Child</a>
                        </li>
                        <li>
                          <a href="#">Great Grand Child</a>
                        </li>
                      </ul>
                    </li>
                    <li><a href="#">Grand Child</a></li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
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

export default class VisualiserComponent extends Vue {}
</script>

<style scoped>
</style>
