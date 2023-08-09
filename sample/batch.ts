import { IBatchHttp } from "..";
const http1 = async (params: any) => {
  return { name: "this is a http" };
};
//TODO: test batch
const http2 = async (params: any) => {
  console.log("should test");
  return { name: "this is a http", params };
};

export const ihttp = IBatchHttp({ http1, http2 }, []);

//const _req = {
//  payments: { search: '' }
//  today_payments: { },
//  today_sales: {}
//}
//const _res = {
//  payments: { results, page }
//  today_payments: { results, page },
//  today_sales: { results, page }
//}
//const allpayments = async (body, state, appState);
//const h = {
//  payments: allpayments
//};
