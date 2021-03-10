export class Person {
  readonly id: string
  readonly name: string
  readonly familyname: string
  readonly yearOfBirth: number
  readonly yearOfDeath: number
  readonly age: number
  readonly level: number

  private readonly parents: Set<Person> = new Set()
  private readonly children: Set<Person> = new Set()
  private readonly spouses: Set<Person> = new Set()

  constructor (id: string, name: string, familyname: string, yearOfBirth: number, yearOfDeath: number, age: number, level: number) {
    this.id = id
    this.name = name
    this.familyname = familyname
    this.yearOfBirth = yearOfBirth
    this.yearOfDeath = yearOfDeath
    this.age = age
    this.level = level
  }

  genTree (): string {
    return ''
  }

  setChild (p: Person, double = false) {
    if (!this.children.has(p)) {
      this.children.add(p)
      if (!double) {
        p.setParent(this, true)
      }
    }
  }

  setParent (p: Person, double = false) {
    if (!this.parents.has(p)) {
      this.parents.add(p)
      if (!double) {
        p.setChild(this, true)
      }
    }
  }

  setSpouse (p: Person, double = false) {
    if (!this.spouses.has(p)) {
      this.spouses.add(p)
      if (!double) {
        p.setSpouse(this, true)
      }
    }
  }
}
