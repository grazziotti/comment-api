class Person {
  sayHello() {
    return 'Daniel'
  }
}

export default Person
it('should sum', () => {
  const person = new Person()

  expect(person.sayHello()).toBe('Daniel')
})
