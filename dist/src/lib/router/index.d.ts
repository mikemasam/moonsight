import { Router } from "express";
export type RouteStat = {
    fullPath: string;
    file: string;
    dir: string;
    location: string;
    path: string;
    router: Router;
    dynamic_route: boolean;
    isFile: boolean;
    isDirectory: boolean;
};
export default function HttpRouter(): Promise<import("../../../dist/lib/context").AppContext>;
