import { Response } from '../responders/index.js';
export default async (ctx) => {
  return async () => {
    return Response({ name: 'this is a name' });
  }
}

export const middleware = ['auth'];
