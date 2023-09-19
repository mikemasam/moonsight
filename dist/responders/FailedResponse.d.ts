import AppResponse from "./lib/AppResponse";
export type FailedResponseOpts = {
    data?: any;
    message?: string;
    status?: number;
};
declare const _default: (opts?: FailedResponseOpts) => AppResponse;
export default _default;
