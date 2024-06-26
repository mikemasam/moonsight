export function makeAsyncHandler(handler:any){
  return async (...args: any) => {
    try {
      return await Promise.resolve(handler(...args));
    } catch (ex) {
      console.log("err");
      throw ex;
    }
  }
}
