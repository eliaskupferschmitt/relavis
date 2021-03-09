import { createStore } from 'vuex'
import { auth, driver, session as sessions } from 'neo4j-driver'

export default createStore({
  state: {
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
    }
  },
  actions: {
  },
  modules: {
  },
  getters: {
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
