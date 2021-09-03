import { FailedResponse } from '../responders/index.js';
export default async (ctx, req, res, addHook) => {
  addHook(paginationHook);
  //return FailedResponse({ status: 401, message: 'Auth failed' });
}

const paginationHook = async (data) => {
  return {
    page: {
      page: 1, 
      pageSize: 2,
      total: data?.total || 0
    }
  }
}
