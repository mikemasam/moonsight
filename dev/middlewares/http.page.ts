import { FailedResponse, IHttpMiddleware } from "../../src";

export default IHttpMiddleware(async (state, req, res, args, addHook) => {
  console.log(state.get("test"));
  addHook(paginationHook);
  return res.failed({ status: 401, message: "Auth failed" });
});

const paginationHook = async (data) => {
  return {
    data: data.results,
    page: {
      page: 1,
      pageSize: 2,
      total: data?.total || 0,
    },
  };
};
