import { AppState } from "../lib/AppState";
import { IHandler } from "./BaseHander";
export type ISubHandler = (state: AppState, channel: string, a: Object) => void;
export default function ISub(handler: ISubHandler, channels: string[], opts?: any): IHandler<void>;
