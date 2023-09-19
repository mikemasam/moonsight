import { RouteStat } from "../lib/router/index";
import { AppState } from "../lib/AppState";
export type ISubHandler = (state: AppState, channel: string, a: Object) => void;
export type ISubHandlerRoute = {
    (stat: RouteStat, name: string): void;
    __ihandler: string;
};
export default function ISub(handler: ISubHandler, channels: string[], opts?: any): ISubHandlerRoute;
