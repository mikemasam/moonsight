import { IAnyMiddlewareRoute } from "../../handlers/BaseHander";
export default function loadMiddlewares(location: string): Promise<IAnyMiddlewareRoute[]>;
