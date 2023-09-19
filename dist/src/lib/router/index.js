"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = require("express");
const logger_1 = __importDefault(require("../logger"));
const http_handlers_1 = require("./http-handlers");
const socket_handler_1 = require("./socket-handler");
const core_handler_1 = require("./core-handler");
const job_handler_1 = require("./job-handler");
const sub_handler_1 = require("./sub-handler");
const middlewares_1 = require("./middlewares");
function HttpRouter() {
    return __awaiter(this, void 0, void 0, function* () {
        const ctx = global.deba_kernel_ctx;
        const { net, opts } = ctx;
        const { httpApp } = net;
        if (opts.apiPath) {
            if (!fs_1.default.existsSync(opts.apiPath))
                throw `[KernelJs] ~ Invalid Route path [api] = ${opts.apiPath}.`;
            const root = (0, express_1.Router)({ mergeParams: true });
            logger_1.default.kernel("...............");
            if (opts.apiMiddlewares != null)
                ctx.net.middlewares = yield (0, middlewares_1.loadMiddlewares)(opts.apiMiddlewares);
            else
                ctx.net.middlewares = [];
            const stat = yield mountPath(opts, root, ctx.opts.apiBasePath);
            //await loadRoutes(ctx, opts.apiPath, root, ctx.opts.basePath);
            const res = yield addRouter(ctx, stat);
            logger_1.default.byType("loader", `Loader: ${stat.location}`, ` ~`, res);
            httpApp.use(root);
            const notFoundRoot = yield (0, http_handlers_1.notFoundRouter)();
            httpApp.use(`*`, notFoundRoot);
        }
        return ctx;
    });
}
exports.default = HttpRouter;
const mountPath = (opts, router, location) => __awaiter(void 0, void 0, void 0, function* () {
    const fullPath = path_1.default.join(opts.apiPath);
    const stat = fs_1.default.statSync(fullPath);
    const routeStat = {
        fullPath: fullPath,
        file: opts.apiMount,
        dir: opts.apiPath,
        location: opts.apiMount.length == 0 ? "" : `/${opts.apiMount}`,
        path: (0, http_handlers_1.cleanRoutePath)(location),
        router: router,
        dynamic_route: false,
        isFile: stat.isFile(),
        isDirectory: stat.isDirectory(),
    };
    return routeStat;
});
const loadRoutes = (ctx, directory, router, location) => __awaiter(void 0, void 0, void 0, function* () {
    const routes = fs_1.default.readdirSync(directory).map((file) => {
        const fullPath = path_1.default.join(directory, file);
        const stat = fs_1.default.statSync(fullPath);
        const routeStat = {
            fullPath: fullPath,
            file: file,
            dir: directory,
            location: `${location}/${file}`,
            path: (0, http_handlers_1.cleanRoutePath)(location),
            router: router,
            dynamic_route: file.indexOf("[") > -1,
            isFile: stat.isFile(),
            isDirectory: stat.isDirectory(),
        };
        return routeStat;
    });
    const r1 = yield Promise.all(routes
        .filter((r) => r.isDirectory && !r.dynamic_route)
        .map((stat) => __awaiter(void 0, void 0, void 0, function* () {
        return addRouter(ctx, stat);
    })));
    const r2 = yield Promise.all(routes
        .filter((r) => r.isFile && !r.dynamic_route)
        .map((stat) => __awaiter(void 0, void 0, void 0, function* () {
        return addRoute(ctx, stat);
    })));
    const r3 = yield Promise.all(routes
        .filter((r) => r.isDirectory && r.dynamic_route)
        .map((stat) => __awaiter(void 0, void 0, void 0, function* () {
        return addRouter(ctx, stat);
    })));
    const r4 = yield Promise.all(routes
        .filter((r) => r.isFile && r.dynamic_route)
        .map((stat) => __awaiter(void 0, void 0, void 0, function* () {
        return addRoute(ctx, stat);
    })));
    let mounted_routes = [...r1, ...r2, ...r3, ...r4];
    const acc = counter();
    const keys = Object.keys(acc);
    for (let o = 0; o < mounted_routes.length; o++)
        for (let i = 0; i < keys.length; i++) {
            acc[keys[i]] += mounted_routes[o][keys[i]];
        }
    return acc;
});
const addRouter = (ctx, stat) => __awaiter(void 0, void 0, void 0, function* () {
    const root = (0, express_1.Router)({ mergeParams: true });
    const total = yield loadRoutes(ctx, stat.fullPath, root, stat.location);
    if (total.ihttp < 1) {
        logger_1.default.byType("components", `Components: ${stat.location}`);
        return total;
    }
    const endpoint = stat.file.replace("[", ":").replace("]", "");
    total.ihttpmount++;
    logger_1.default.byType("httpmount", `IHttpMount: ${stat.location}`, endpoint);
    stat.router.use(`/${endpoint}`, root);
    return total;
});
const counter = () => {
    return {
        icom: 0,
        isub: 0,
        ijob: 0,
        imount: 0,
        isocketmount: 0,
        ihttp: 0,
        ihttpmount: 0,
        icore: 0,
        isocket: 0,
    };
};
const addRoute = (ctx, stat) => __awaiter(void 0, void 0, void 0, function* () {
    const found = counter();
    if (!stat.file.match(/\.js|\.ts$/)) {
        logger_1.default.byType("components", `route skipped ${stat.fullPath}`);
        return found;
    }
    const routes = yield loadRouteModule(stat);
    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        if ((route === null || route === void 0 ? void 0 : route.__ihandler) == "imount") {
            found.imount++;
            logger_1.default.byType("mount", `IMount: ${stat.location}`);
            route(stat);
        }
        else if ((route === null || route === void 0 ? void 0 : route.__ihandler) == "isocketmount") {
            found.isocketmount++;
            yield (0, socket_handler_1.addISocketMount)(stat, route);
        }
        else if ((route === null || route === void 0 ? void 0 : route.__ihandler) == "ijob") {
            found.ijob++;
            yield (0, job_handler_1.addIJobRoute)(stat, route);
        }
        else if ((route === null || route === void 0 ? void 0 : route.__ihandler) == "isub") {
            found.isub++;
            yield (0, sub_handler_1.addISubRoute)(stat, route);
        }
    }
    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        if ((route === null || route === void 0 ? void 0 : route.__ihandler) == "ihttp") {
            found.ihttp++;
            yield (0, http_handlers_1.addIHttpRoute)(stat.router, stat, route);
        }
        else if ((route === null || route === void 0 ? void 0 : route.__ihandler) == "isocket") {
            found.isocket++;
            yield (0, socket_handler_1.addISocketRoute)(stat, route);
        }
        else if ((route === null || route === void 0 ? void 0 : route.__ihandler) == "icore") {
            found.icore++;
            yield (0, core_handler_1.addICoreRoute)(stat, route);
        }
        else {
            found.icom++;
        }
    }
    return found;
    //console.log("--------------------------------------------------")
});
const loadRouteModule = (stat) => __awaiter(void 0, void 0, void 0, function* () {
    const module = yield Promise.resolve(`${stat.fullPath}`).then(s => __importStar(require(s)));
    const routes = Object.keys(module).filter((n) => n != "default");
    return routes.map((r) => module[r]);
});
