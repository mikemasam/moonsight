/// <reference types="node" />
import EventEmitter from "events";
import { Server } from "socket.io";
import { AppContextOpts } from "../context";
export default function ClientSocket(io: Server, events: EventEmitter, opts: AppContextOpts): Promise<import("socket.io").Namespace<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>>;
