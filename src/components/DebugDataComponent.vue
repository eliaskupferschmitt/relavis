<template>
  <div class="container-fluid">
    <vue-json-pretty :data="debugData" :deep="deep" :showLength="showLength"/>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

@Options({
  components: {
    VueJsonPretty
  },
  computed: {
    debugData () {
      return this.$store.getters.debugData
    },
    persons () {
      return this.$store.getters.persons
    }
  }
})
export default class DebugDataComponent extends Vue {
  data () {
    return {
      deep: 1,
      showLength: true
    }
  }
}
</script>
