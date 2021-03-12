<template>
  <div class="container-fluid">
    <div id="mynetwork"></div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import store from '../store/'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const vis = require('vis-network/dist/vis-network.min.js')

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

export default class VisualiserComponent extends Vue {
  options = {
    autoResize: true,
    height: '100%',
    width: '100%',
    locale: 'en',
    // locales: locales,
    clickToUse: false,
    edges: {
      arrows: 'to',
      color: 'red',
      font: '12px arial #ff0000',
      scaling: {
        label: true
      },
      shadow: true,
      smooth: false
    },
    nodes: {
      fixed: {
        x: false,
        y: true
      },
      shape: 'box',
      widthConstraint: 100
      /* color: '#ff0000',
      fixed: false,
      font: '12px arial red',
      scaling: {
        label: true
      },
      shadow: true */
    },
    interaction: {
      dragNodes: true,
      dragView: true,
      hideEdgesOnDrag: false,
      hideEdgesOnZoom: false,
      hideNodesOnDrag: false,
      hover: false,
      hoverConnectedEdges: true,
      keyboard: {
        enabled: false,
        speed: { x: 10, y: 10, zoom: 0.02 },
        bindToWindow: true
      },
      multiselect: false,
      navigationButtons: false,
      selectable: true,
      selectConnectedEdges: true,
      tooltipDelay: 300,
      zoomSpeed: 1,
      zoomView: true
    },
    physics: {
      enabled: true,
      solver: 'barnesHut',
      maxVelocity: 30,
      barnesHut: {
        gravitationalConstant: -10000,
        damping: 0.09,
        springConstant: 0.001
      }
    }
  }

  container: HTMLElement | null = null
  network = null

  mounted () {
    this.container = document.getElementById('mynetwork')
    const network = new vis.Network(this.container, store.state.visData, this.options)
    network.on('selectNode', (properties: any) => {
      store.commit('select', {
        id: properties.nodes[0]
      })
    })
    this.network = network
  }
}
</script>

<style scoped>
</style>
