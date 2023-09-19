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
const index_js_1 = __importDefault(require("../doctor/index.js"));
let doctor = await (0, index_js_1.default)({ host: 'localhost:3003', socket: true });
//beforeAll(async () => {
//  doctor = await Doctor({ host: 'localhost:3003', socket: true });
//});
//afterAll(() => {
//  doctor.cleanup();
//});
it('GET /api', () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield doctor.http().get(`http://${doctor.host}/api`);
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.data.message).toBe("");
    expect(res.data.success).toBe(true);
}));
it('SOCKET /api', () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield doctor.socket().emitAsync(':api', { hi: 1 });
    expect(res).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.message).toBe("");
    expect(res.success).toBe(true);
}));
