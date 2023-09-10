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
  return new AppResponse({
    data: opts?.data || null,
    status: opts?.status || 400,
    message: opts?.message || "Failed",
  });
};
