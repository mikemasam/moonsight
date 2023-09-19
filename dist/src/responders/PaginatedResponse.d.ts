import { RouteResponseOpts } from "../handlers/BaseHander";
import AppResponse from "./lib/AppResponse";
type PaginatedResult = {
    results: [];
};
export default function PaginatedResponse(data: PaginatedResult, opts?: RouteResponseOpts): AppResponse;
export {};
