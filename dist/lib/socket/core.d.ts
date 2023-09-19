/// <reference types="node" />
import { Namespace, Server } from "socket.io";
import EventEmitter from "events";
import { AppContextOpts } from "../context";
export default function CoreSocket(io: Server, events: EventEmitter, opts: AppContextOpts): Promise<Namespace<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>>;
