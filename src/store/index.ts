import { createStore } from 'vuex'
import { auth, driver, session as sessions } from 'neo4j-driver'
import { Person } from '@/typescript/Person'

export default createStore({
  state: {
    activeComponent: 0,
    debugData: { },
    driver: driver(
      'neo4j://datascience.mni.thm.de',
      auth.basic('gruppe09', 'gruppe09')
    ),
    persons: new Map<string, Person>(),
    tableHeader: ['Name', 'Family name', 'Born', 'Died', 'Age'],
    table: [['']],
    tableInit: false,
    tableReady: false
  },
  mutations: {
    search (state, payload) {
      state.tableReady = false
      state.tableInit = true
      const session = state.driver.session({
        defaultAccessMode: sessions.READ,
        database: 'genealogy'
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
              p.name,
              Object.prototype.hasOwnProperty.call(p, 'familyname') ? p.familyname : '',
              Object.prototype.hasOwnProperty.call(p, 'yearOfBirth') ? p.yearOfBirth : '',
              Object.prototype.hasOwnProperty.call(p, 'yearOfDeath') ? p.yearOfDeath : '',
              Object.prototype.hasOwnProperty.call(p, 'age') ? p.age.low : ''
            ])
          })
          state.tableReady = true
        })
        .catch(error => console.error(error))
        .then(() => session.close())
    },
    visualSearch (state, payload) {
      state.tableReady = false
      state.tableInit = true
      const session = state.driver.session({
        defaultAccessMode: sessions.READ,
        database: 'genealogy'
      })
      session
        .run(
          'MATCH (a: Person) ' +
          'WHERE a.name =~ $name ' +
          'OPTIONAL MATCH (b: Person)-[:SPOUSE]-(a) ' +
          'OPTIONAL MATCH (c: Person)-[:CHILD_OF]-(a) ' +
          'RETURN * ' +
          'ORDER BY a.name;', {
            name: `(?i).*${payload.name}.*` // TODO prevent input containing regex from crashing query
          })
        .then(result => {
          state.debugData = result.records
          state.table = []
          result.records.forEach(record => {
            const personA = record.get('a').properties
            const personB = record.get('b').properties
            const personC = record.get('c').properties
            const person = new Person(
              personA.genID,
              personA.name,
              Object.prototype.hasOwnProperty.call(personA, 'familyname') ? personA.familyname : '',
              Object.prototype.hasOwnProperty.call(personA, 'yearOfBirth') ? personA.yearOfBirth : NaN,
              Object.prototype.hasOwnProperty.call(personA, 'yearOfDeath') ? personA.yearOfDeath : NaN,
              Object.prototype.hasOwnProperty.call(personA, 'age') ? personA.age.low : NaN,
              Object.prototype.hasOwnProperty.call(personA, 'level') ? personA.age.low : NaN
            )
            if (!state.persons.has(person.id)) {
              state.persons.set(person.id, person)
            }
            state.table.push([
              personA.name,
              Object.prototype.hasOwnProperty.call(personA, 'familyname') ? personA.familyname : '',
              Object.prototype.hasOwnProperty.call(personA, 'yearOfBirth') ? personA.yearOfBirth : '',
              Object.prototype.hasOwnProperty.call(personA, 'yearOfDeath') ? personA.yearOfDeath : '',
              Object.prototype.hasOwnProperty.call(personA, 'age') ? personA.age.low : ''
            ],
            [
              personB.name,
              Object.prototype.hasOwnProperty.call(personB, 'familyname') ? personB.familyname : '',
              Object.prototype.hasOwnProperty.call(personB, 'yearOfBirth') ? personB.yearOfBirth : '',
              Object.prototype.hasOwnProperty.call(personB, 'yearOfDeath') ? personB.yearOfDeath : '',
              Object.prototype.hasOwnProperty.call(personB, 'age') ? personB.age.low : ''
            ],
            [
              personC.name,
              Object.prototype.hasOwnProperty.call(personC, 'familyname') ? personC.familyname : '',
              Object.prototype.hasOwnProperty.call(personC, 'yearOfBirth') ? personC.yearOfBirth : '',
              Object.prototype.hasOwnProperty.call(personC, 'yearOfDeath') ? personC.yearOfDeath : '',
              Object.prototype.hasOwnProperty.call(personC, 'age') ? personC.age.low : ''
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
    debugData (state) {
      return state.debugData
    },
    persons (state) {
      return state.persons
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
    }
  }
})
