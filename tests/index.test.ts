import { greet } from '../src';

test('greet function', () => {
  expect(greet('World')).toBe('Hello, World!');
});
