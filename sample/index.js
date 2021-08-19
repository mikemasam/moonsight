import { Response } from '../responders/index.js';
import { IHttp } from '../handlers/index.js';
const http = async () => {
  return Response({ name: 'this is a name' });
}

export const ihttp = IHttp(http, []);
