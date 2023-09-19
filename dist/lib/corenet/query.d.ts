import CoreNetSelector from "./net";
import { CoreResponse } from "../../handlers/BaseHander";
export default class CoreNetQuery {
    private selector;
    private channel;
    constructor(selector: CoreNetSelector, channel: string);
    selectQuery<T>(dpath: string, body: Object): Promise<CoreResponse<T>>;
    query<T>(event: string, body: Object): Promise<CoreResponse<T>>;
    private _query;
    private __remoteQuery;
    private __localQuery;
    private __handleFailed;
}
