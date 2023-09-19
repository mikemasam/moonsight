import { AppState } from "../lib/AppState";
import { RouteStat } from "./BaseHander";
type IJobConfig = {
    seconds: number;
    instant: boolean;
};
declare function IJob(handler: IJobHandler, opts: IJobConfig, args: Object): {
    (stat: RouteStat, name: string): void;
    __ihandler: string;
};
declare namespace IJob {
    var CONTINUE: number;
    var OK: number;
    var BACKOFF: number;
    var EMPTY: number;
    var BUSY: number;
    var FAILED: number;
    var _ERRORED: number;
}
export default IJob;
type IJobHandler = (state: AppState, args: Object) => Promise<[number, string]>;
