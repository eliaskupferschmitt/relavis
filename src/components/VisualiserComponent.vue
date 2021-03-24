<template>
  <div class="container-fluid">
    <div id="visualiser" ref="visualiser"></div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import store from '../store/'
import { Network } from 'vis-network'

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
    clickToUse: false,
    edges: {
      arrows: 'to',
      font: {
        align: 'top',
        face: 'arial',
        size: 12
      },
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

  container: HTMLElement | undefined
  network: Network | undefined

  mounted () {
    this.container = this.$refs.visualiser as HTMLElement
    const network = new Network(this.container, store.state.visData, this.options)
    network.on('selectNode', (properties: { nodes: string[] }) => {
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
