import { RouteResponseOpts } from "../handlers/BaseHander";
import AppResponse from "./lib/AppResponse";
type PaginatedResult<T> = {
    results: T[];
};
export default function PaginatedResponse<T>(data: PaginatedResult<T>, opts?: RouteResponseOpts): AppResponse;
export {};
