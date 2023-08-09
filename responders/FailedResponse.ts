import AppResponse from "./lib/AppResponse";
export type FailedResponseOpts = {
  data?: any;
  message?: string;
  status?: number;
};

//  data = {},
//  message = "failed",
//  status = 400,
export default (opts?: FailedResponseOpts) => {
  return new AppResponse(
    opts?.data || null,
    opts?.status || 400,
    opts?.message || "Failed"
  );
};
