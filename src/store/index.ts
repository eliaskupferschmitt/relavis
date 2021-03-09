import { createStore } from 'vuex'
import { auth, driver, session as sessions } from 'neo4j-driver'

export default createStore({
  state: {
    activeComponent: 0,
    driver: driver(
      'neo4j://datascience.mni.thm.de',
      auth.basic('gruppe09', 'gruppe09')
    ),
    tableHeader: ['Name', 'Family name', 'Born', 'Died', 'Age'],
    table: [['']],
    tableReady: false
  },
  mutations: {
    search (state, payload) {
      state.tableReady = false
      const session = state.driver.session({
        defaultAccessMode: sessions.READ,
        database: 'genealogy'
      })
      session
        .run('MATCH (n: Person) WHERE n.name =~ $name RETURN * ORDER BY n.name;', {
          name: `(?i).*${payload.name}.*` // TODO prevent input containing regex from crashing query
        })
        .then(result => {
          state.table = []
          result.records.forEach(record => {
            const person = record.get('n').properties
            state.table.push([
              person.name,
              Object.prototype.hasOwnProperty.call(person, 'familyname') ? person.familyname : '',
              Object.prototype.hasOwnProperty.call(person, 'yearOfBirth') ? person.yearOfBirth : '',
              Object.prototype.hasOwnProperty.call(person, 'yearOfDeath') ? person.yearOfDeath : '',
              Object.prototype.hasOwnProperty.call(person, 'age') ? person.age.low : ''
            ])
          })
          state.tableReady = true
        })
        .catch(error => console.error(error))
        .then(() => session.close())
    },
    visualSearch (state, payload) {
      state.tableReady = false
      const session = state.driver.session({
        defaultAccessMode: sessions.READ,
        database: 'genealogy'
      })
      session
        .run('MATCH (o: Person)-[:CHILD_OF]->(n: Person)-[:CHILD_OF]->(m: Person) WHERE n.name =~ $name RETURN * ORDER BY n.name;', {
          name: `(?i).*${payload.name}.*` // TODO prevent input containing regex from crashing query
        })
        .then(result => {
          state.table = []
          result.records.forEach(record => {
            const personN = record.get('n').properties
            const personO = record.get('o').properties
            const personM = record.get('m').properties
            state.table.push([
              personN.name,
              Object.prototype.hasOwnProperty.call(personN, 'familyname') ? personN.familyname : '',
              Object.prototype.hasOwnProperty.call(personN, 'yearOfBirth') ? personN.yearOfBirth : '',
              Object.prototype.hasOwnProperty.call(personN, 'yearOfDeath') ? personN.yearOfDeath : '',
              Object.prototype.hasOwnProperty.call(personN, 'age') ? personN.age.low : ''
            ],
            [
              personO.name,
              Object.prototype.hasOwnProperty.call(personO, 'familyname') ? personO.familyname : '',
              Object.prototype.hasOwnProperty.call(personO, 'yearOfBirth') ? personO.yearOfBirth : '',
              Object.prototype.hasOwnProperty.call(personO, 'yearOfDeath') ? personO.yearOfDeath : '',
              Object.prototype.hasOwnProperty.call(personO, 'age') ? personO.age.low : ''
            ],
            [
              personM.name,
              Object.prototype.hasOwnProperty.call(personM, 'familyname') ? personM.familyname : '',
              Object.prototype.hasOwnProperty.call(personM, 'yearOfBirth') ? personM.yearOfBirth : '',
              Object.prototype.hasOwnProperty.call(personM, 'yearOfDeath') ? personM.yearOfDeath : '',
              Object.prototype.hasOwnProperty.call(personM, 'age') ? personM.age.low : ''
            ]
            )
          })
          state.tableReady = true
        })
        .catch(error => console.error(error))
        .then(() => session.close())
    },
    setActiveComponent (state, payload) {
      state.activeComponent = payload.n
    }
  },
  actions: {},
  modules: {},
  getters: {
    activeComponent (state): number {
      return state.activeComponent
    },
    tableHeader (state) {
      return state.tableHeader
    },
    table (state) {
      return state.table
    },
    tableReady (state) {
      return state.tableReady
    }
  }
})
