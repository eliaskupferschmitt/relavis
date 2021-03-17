import { createStore } from 'vuex'
import { auth, driver, session as sessions } from 'neo4j-driver'
import { url, username, password, database } from '../../database.json'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const vis = require('vis-network/dist/vis-network.min.js')

export default createStore({
  state: {
    activeComponent: 0,
    debugData: { },
    driver: driver(
      url,
      auth.basic(username, password)
    ),
    heightSep: 200,
    sidebar: [
      'Search results',
      'Family tree'
    ],
    tableHeader: ['ID', 'Name', 'Family name', 'Born', 'Died', 'Age'],
    table: [['']],
    tableInit: false,
    tableReady: false,
    queried: new Set<string>(),
    visData: {
      nodes: new vis.DataSet([]),
      edges: new vis.DataSet([])
    },
    widthSep: 200
  },
  mutations: {
    search (state, payload) {
      state.tableReady = false
      state.tableInit = true
      const session = state.driver.session({
        defaultAccessMode: sessions.READ,
        database: database
      })
      session
        .run(
          'MATCH (n: Person) ' +
          'WHERE n.name =~ $name ' +
          'RETURN * ORDER BY ' +
          'n.name;', {
            name: `(?i).*${payload.name}.*` // TODO prevent input containing regex from crashing query
          })
        .then(result => {
          state.debugData = result.records
          state.table = []
          result.records.forEach(record => {
            const p = record.get('n').properties
            state.table.push([
              p.genID,
              p.name,
              Object.prototype.hasOwnProperty.call(p, 'familyname') ? p.familyname : '',
              Object.prototype.hasOwnProperty.call(p, 'yearOfBirth') ? p.yearOfBirth : '',
              Object.prototype.hasOwnProperty.call(p, 'yearOfDeath') ? p.yearOfDeath : '',
              Object.prototype.hasOwnProperty.call(p, 'age') ? p.age.low : ''
            ])
          })
          state.tableReady = true
          state.activeComponent = 0
        })
        .catch(error => console.error(error))
        .then(() => session.close())
    },
    select (state, payload) {
      if (payload.reset) {
        state.visData.nodes.clear()
        state.visData.edges.clear()
      }
      if (state.queried.has(payload.id)) { return }
      const session = state.driver.session({
        defaultAccessMode: sessions.READ,
        database: database
      })
      session
        .run(
          'MATCH (p1: Person)-[r]->(p2: Person) ' +
          'WHERE p1.genID = $id ' +
          'OR p2.genID = $id ' +
          'RETURN p1, p2, type(r) AS type, p1.genID = $id AS isP1;', {
            id: payload.id
          })
        .then(result => {
          state.debugData = result
          const nodes = state.visData.nodes
          const edges = state.visData.edges
          const visNode = state.visData.nodes.get(payload.id)
          const heightLevel = visNode ? visNode.level : 1
          const heightSpacer = 200
          const widthSpacer = 200
          let nextParentX = -widthSpacer
          let nextPersonX = -widthSpacer
          let nextChildrenX = -widthSpacer
          result.records
            .forEach(record => {
              const p1 = record.get('p1').properties
              const p2 = record.get('p2').properties
              const type: string = record.get('type')
              const isP1: boolean = record.get('isP1')
              const id1: string = p1.genID
              const id2: string = p2.genID
              if (isP1) {
                state.queried.add(id1)
              } else {
                state.queried.add(id2)
              }
              if (!nodes.get(id1)) {
                nodes.add({
                  id: id1,
                  label: p1.name,
                  x: type === 'SPOUSE' || isP1 ? (nextPersonX += widthSpacer) : (nextParentX += widthSpacer),
                  y: type === 'SPOUSE' || isP1 ? heightLevel * heightSpacer : heightLevel * heightSpacer + heightSpacer,
                  level: type === 'SPOUSE' || isP1 ? heightLevel : heightLevel + 1,
                  groups: isP1 ? 'satisfied' : 'unsatisfied'
                })
              }
              if (!nodes.get(id2)) {
                nodes.add({
                  id: id2,
                  label: p2.name,
                  x: type === 'SPOUSE' || !isP1 ? (nextPersonX += widthSpacer) : (nextChildrenX += widthSpacer),
                  y: type === 'SPOUSE' || !isP1 ? heightLevel * heightSpacer : heightLevel * heightSpacer - heightSpacer,
                  level: type === 'SPOUSE' || !isP1 ? heightLevel : heightLevel - 1,
                  groups: !isP1 ? 'satisfied' : 'unsatisfied'
                })
              }
              if (type === 'SPOUSE' && !edges.get(id1 + 's' + id2) && isP1) {
                edges.add({
                  id: id1 + 's' + id2,
                  from: id1,
                  to: id2,
                  color: 'green'
                })
              } else if (type === 'CHILD_OF' && !edges.get(id2 + 'c' + id1) && isP1) {
                edges.add({
                  id: id2 + 'c' + id1,
                  from: id2,
                  to: id1,
                  color: 'red'
                })
              } else if (type === 'SPOUSE' && !edges.get(id1 + 's' + id2)) {
                edges.add({
                  id: id1 + 's' + id2,
                  from: id1,
                  to: id2,
                  color: 'green'
                })
              } else if (type === 'CHILD_OF' && !edges.get(id2 + 'c' + id1)) {
                edges.add({
                  id: id2 + 'c' + id1,
                  from: id2,
                  to: id1,
                  color: 'blue'
                })
              }
            })
          state.activeComponent = 1
        })
        .catch(error => console.error(error))
        .then(() => session.close())
    },
    setActiveComponent (state, payload) {
      state.activeComponent = payload.n
    },
    debugSidebar (state) {
      if (!state.sidebar.includes('Debug')) {
        state.sidebar.push('Debug')
      }
    }
  },
  actions: {},
  modules: {},
  getters: {
    activeComponent (state): number {
      return state.activeComponent
    },
    debugData (state) {
      return state.debugData
    },
    sidebar (state) {
      return state.sidebar
    },
    table (state) {
      return state.table
    },
    tableHeader (state) {
      return state.tableHeader
    },
    tableInit (state) {
      return state.tableInit
    },
    tableReady (state) {
      return state.tableReady
    },
    visData (state) {
      return state.visData
    }
  }
})
