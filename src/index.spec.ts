import { Person } from '@/index'

it('should sum', () => {
  const person = new Person()

  expect(person.sayHello()).toBe('Daniel')
})
