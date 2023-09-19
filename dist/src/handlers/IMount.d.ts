import { Router } from "express";
import { RouteStat } from "../lib/router";
import { AppState } from "../lib/AppState";
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
