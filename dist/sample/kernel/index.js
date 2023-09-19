"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imount = void 0;
const IMount_1 = __importDefault(require("../../handlers/IMount"));
const corenet_1 = require("../../lib/corenet");
exports.imount = (0, IMount_1.default)((appState) => __awaiter(void 0, void 0, void 0, function* () {
    appState.events().on("kernel.connection", (opts) => load$subs$state(opts));
    //console.log("mounted");
}));
const load$subs$state = (opts) => __awaiter(void 0, void 0, void 0, function* () {
    if (opts.state != "connection")
        return;
    const subs_state = yield corenet_1.CoreNet.select(opts.channel.name).query(":api:kernel:subscriptions:state", {});
    //console.log("substate", subs_state);
    //await CoreNet.select(opts.channel.name).query(':api:kernel:connection', {});
});
