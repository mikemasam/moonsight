import { FailedResponse } from '../responders/index.js';
export default async (ctx) => {
  return {
    'auth': auth,
  }
}

const auth = async (req, res) => {
  return FailedResponse({ status: 401, message: 'Auth failed' });
}
