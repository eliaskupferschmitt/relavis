import { createStore } from 'vuex'
import { auth, driver, session as sessions } from 'neo4j-driver'
import { url, username, password, database } from '../../database.json'
import { DataSet } from 'vis-data'

class NoMissingLinks extends Error {
}

interface Edge {
  arrows: string;
  color: string;
  from: string;
  id: string;
  label: string;
  to: string;
}

interface Node {
  id: string;
  label: string;
  level: number;
  x: number;
  y: number;
}

function addConnection (from: string, to: string, type: string, edges: DataSet<Edge>) {
  switch (type) {
    case 'CHILD_OF': {
      const id = from + 'c' + to
      if (edges.get(id)) { return }
      edges.add({
        arrows: 'to',
        color: 'red',
        from: from,
        id: id,
        label: 'child of',
        to: to
      }, id)
      break
    }
    case 'SPOUSE': {
      const id = from + 's' + to
      const idR = to + 's' + from
      if (edges.get(id)) { return }
      const edge = edges.get(idR)
      if (edge) {
        edges.remove(edge.id)
        edge.arrows = 'from, to'
        edges.add(edge, id)
      } else {
        edges.add({
          arrows: 'to',
          color: 'green',
          from: from,
          id: id,
          label: 'spouse',
          to: to
        }, id)
      }
      break
    }
  }
}

export default createStore({
  state: {
    activeComponent: 0,
    debugData: { },
    driver: driver(
      url,
      auth.basic(username, password)
    ),
    heightSep: 200,
    linked: new Set<string>(),
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
      nodes: new DataSet<Node, 'id'>([]),
      edges: new DataSet<Edge, 'id'>([])
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
          'RETURN p1, p2, type(r) AS type;', {
            id: payload.id
          })
        .then(result => {
          state.debugData = result
          const nodes = state.visData.nodes
          const edges = state.visData.edges
          const visNode = state.visData.nodes.get(payload.id)
          const heightLevel = visNode ? Array.isArray(visNode) ? visNode[0].level : (visNode as { level: number }).level : 1
          const heightSpacer = 200
          const widthSpacer = 200
          let nextPersonX = -widthSpacer
          let nextChildrenX = -widthSpacer
          result.records
            .forEach(record => {
              const p1 = record.get('p1').properties
              const p2 = record.get('p2').properties
              const type: string = record.get('type')
              const id1: string = p1.genID
              const id2: string = p2.genID
              state.linked.add(id1)
              state.queried.add(id1)
              if (!nodes.get(id1)) {
                nodes.add({
                  id: id1,
                  label: p1.name,
                  x: (nextPersonX += widthSpacer),
                  y: heightLevel * heightSpacer,
                  level: heightLevel
                }, id1)
              }
              if (!nodes.get(id2)) {
                nodes.add({
                  id: id2,
                  label: p2.name,
                  x: type === 'SPOUSE' ? (nextPersonX += widthSpacer) : (nextChildrenX += widthSpacer),
                  y: type === 'SPOUSE' ? heightLevel * heightSpacer : heightLevel * heightSpacer - heightSpacer,
                  level: type === 'SPOUSE' ? heightLevel : heightLevel - 1
                }, id2)
              }
              addConnection(id1, id2, type, edges)
            })
        })
        .then(() => session.run(
          'MATCH (p1: Person)<-[r]-(p2: Person) ' +
          'WHERE p1.genID = $id ' +
          'RETURN p1, p2, type(r) AS type;', {
            id: payload.id
          }))
        .then(result => {
          state.debugData = result
          const nodes = state.visData.nodes
          const edges = state.visData.edges
          const visNode = state.visData.nodes.get(payload.id)
          const heightLevel = visNode ? Array.isArray(visNode) ? visNode[0].level : (visNode as { level: number }).level : 1
          const heightSpacer = 200
          const widthSpacer = 200
          let nextPersonX = -widthSpacer
          let nextChildrenX = -widthSpacer
          result.records
            .forEach(record => {
              const p1 = record.get('p1').properties
              const p2 = record.get('p2').properties
              const type: string = record.get('type')
              const id1: string = p1.genID
              const id2: string = p2.genID
              if (!nodes.get(id2)) {
                nodes.add({
                  id: id2,
                  label: p2.name,
                  x: type === 'SPOUSE' ? (nextPersonX += widthSpacer) : (nextChildrenX += widthSpacer),
                  y: type === 'SPOUSE' ? heightLevel * heightSpacer : heightLevel * heightSpacer + heightSpacer,
                  level: type === 'SPOUSE' ? heightLevel : heightLevel + 1
                }, id2)
              }
              addConnection(id2, id1, type, edges)
            })
          state.activeComponent = 1
        })
        .then(() => {
          const missingLinks = state.visData.nodes.get({
            fields: ['id'],
            filter: (node: {id: string}) => !state.queried.has(node.id) && !state.linked.has(node.id)
          }).map((node: {id: string}) => `${node.id}`)
          if (missingLinks.length === 0) { throw new NoMissingLinks() }
          const query =
            'MATCH (p1: Person)-[r]-(p2: Person) ' +
            `WHERE ${missingLinks.map((id: string) => `p1.genID = "${id}"`).join(' OR ')} ` +
            'RETURN DISTINCT p1, p2, startnode(r).genID as from, type(r) as type;'
          missingLinks.forEach((id: string) => state.linked.add(id))
          return session.run(query)
        })
        .then(result => {
          const edges = state.visData.edges.get({
            fields: ['id', 'from', 'to']
          })
          result.records
            .filter(record => {
              const p1 = record.get('p1').properties
              const p2 = record.get('p2').properties
              const from: string = record.get('from')
              return !edges.some((edge: {id: string; from: string; to: string}) => (edge.from === from) && (edge.to === (from === p1 ? p2 : p1)))
            })
            .forEach(record => {
              const p1 = record.get('p1').properties
              const p2 = record.get('p2').properties
              const id1: string = p1.genID
              const id2: string = p2.genID
              const type: string = record.get('type')
              const isP1: boolean = record.get('from') === id1
              const edges = state.visData.edges
              if (isP1) {
                addConnection(id1, id2, type, edges)
              } else {
                addConnection(id2, id1, type, edges)
              }
            })
        })
        .catch(error => {
          if (!(error instanceof NoMissingLinks)) {
            console.error(error)
          }
        })
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
