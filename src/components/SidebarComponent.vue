<template>
    <div class="bg-light border-right" id="sidebar-wrapper">
      <div class="sidebar-heading">relavis</div>
      <div class="list-group list-group-flush">
        <button class="list-group-item list-group-item-action bg-light" :key="i" v-for="(c, i) in content" @click="c.action()">{{c.title}}</button>
      </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

class SidebarObject {
  readonly title: string
  readonly action: Function

  constructor (title: string, action?: Function) {
    this.title = title
    this.action = action !== undefined ? action : () => {
      console.log(`triggered default action for ${title}`)
    }
  }
}

@Options({
  props: {
  }
})
export default class SidebarComponent extends Vue {
  data () {
    return {
      content: [
        new SidebarObject('Lorem', () => alert('This is an example action!')),
        new SidebarObject('Ipsum'),
        new SidebarObject('dolor'),
        new SidebarObject('sit'),
        new SidebarObject('amet')
      ]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
