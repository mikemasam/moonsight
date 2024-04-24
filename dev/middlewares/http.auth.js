import { FailedResponse } from "../../src";

export default async (state, req, res, args, addHook) => {
  console.log(state.get('test'));
  addHook(paginationHook);
  return FailedResponse({ status: 401, message: 'Auth failed' });
}

const paginationHook = async (data) => {
  return {
    data: data.results,
    page: {
      page: 1, 
      pageSize: 2,
      total: data?.total || 0
    }
  }
}
