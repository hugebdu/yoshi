import { method } from 'yoshi-server';

export const greet = method(function(name: string) {
  return { greeting: name };
});
