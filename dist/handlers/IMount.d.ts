import { Router } from "express";
import { AppState } from "../lib/AppState";
import { RouteStat } from "./BaseHander";
type IMountArgs = {
    path: string;
    router: Router;
};
type IMountHandler = (state: AppState, args: IMountArgs) => Promise<any>;
export default function IMount(handler: IMountHandler, opts?: string[]): {
    (stat: RouteStat): void;
    __ihandler: string;
};
export {};
