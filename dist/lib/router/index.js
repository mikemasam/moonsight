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
const middlewares_1 = __importDefault(require("./middlewares"));
async function HttpRouter() {
    const ctx = global.deba_kernel_ctx;
    const { net, opts } = ctx;
    const { httpApp } = net;
    if (opts.apiPath) {
        if (!fs_1.default.existsSync(opts.apiPath))
            throw `[KernelJs] ~ Invalid Route path [api] = ${opts.apiPath}.`;
        const root = (0, express_1.Router)({ mergeParams: true });
        logger_1.default.kernel("...............");
        if (opts.apiMiddlewares != null)
            ctx.net.middlewares = await (0, middlewares_1.default)(opts.apiMiddlewares);
        else
            ctx.net.middlewares = [];
        const stat = await mountPath(opts, root, ctx.opts.apiBasePath);
        const res = await addRouter(ctx, stat);
        logger_1.default.byType("debug", `Loader: ${stat.location}`, ` ~`, res);
        httpApp.use(root);
        httpApp.use("*", (0, http_handlers_1.notFoundRouter)());
    }
    return ctx;
}
exports.default = HttpRouter;
const mountPath = async (opts, router, location) => {
    const fullPath = path_1.default.join(opts.apiPath);
    const stat = fs_1.default.statSync(fullPath);
    const routeStat = {
        pos: 0,
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
};
const loadRoutes = async (ctx, router, $stat) => {
    const routes = fs_1.default.readdirSync($stat.fullPath).map((file) => {
        const fullPath = path_1.default.join($stat.fullPath, file);
        const stat = fs_1.default.statSync(fullPath);
        const routeStat = {
            pos: $stat.pos + 1,
            fullPath: fullPath,
            file: file,
            dir: $stat.fullPath,
            location: `${$stat.location}/${file}`,
            path: (0, http_handlers_1.cleanRoutePath)($stat.location),
            router: router,
            dynamic_route: file.indexOf("[") > -1,
            isFile: stat.isFile(),
            isDirectory: stat.isDirectory(),
        };
        return routeStat;
    });
    const r1 = await Promise.all(routes
        .filter((r) => r.isDirectory && !r.dynamic_route)
        .map(async (stat) => {
        return addRouter(ctx, stat);
    }));
    const r2 = await Promise.all(routes
        .filter((r) => r.isFile && !r.dynamic_route)
        .map(async (stat) => {
        return addRoute(ctx, stat);
    }));
    const r3 = await Promise.all(routes
        .filter((r) => r.isDirectory && r.dynamic_route)
        .map(async (stat) => {
        return addRouter(ctx, stat);
    }));
    const r4 = await Promise.all(routes
        .filter((r) => r.isFile && r.dynamic_route)
        .map(async (stat) => {
        return addRoute(ctx, stat);
    }));
    let mounted_routes = [...r1, ...r2, ...r3, ...r4];
    const acc = counter();
    const keys = Object.keys(acc);
    for (let o = 0; o < mounted_routes.length; o++)
        for (let i = 0; i < keys.length; i++) {
            acc[keys[i]] += mounted_routes[o][keys[i]];
        }
    return acc;
};
const addRouter = async (ctx, stat) => {
    const root = (0, express_1.Router)({ mergeParams: true });
    const total = await loadRoutes(ctx, root, stat);
    if (total.ihttp < 1) {
        logger_1.default.byTypes(["components", "debug"], `Components: ${stat.location}`);
        return total;
    }
    const endpoint = stat.file.replace("[", ":").replace("]", "");
    total.ihttpmount++;
    logger_1.default.byTypes(["httpmount", "debug"], `IHttpMount: ${stat.location}`, endpoint);
    stat.router.use(`/${endpoint}`, root);
    return total;
};
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
const addRoute = async (ctx, stat) => {
    const found = counter();
    if (!stat.file.match(/\.js|\.ts$/)) {
        logger_1.default.byTypes(["components", "debug"], `route skipped ${stat.fullPath}`);
        return found;
    }
    const routes = await loadRouteModule(stat);
    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        if ((route === null || route === void 0 ? void 0 : route.__ihandler) == "imount") {
            found.imount++;
            logger_1.default.byTypes(["mount", "debug"], `IMount: ${stat.location}`);
            route(stat);
        }
        else if ((route === null || route === void 0 ? void 0 : route.__ihandler) == "isocketmount") {
            found.isocketmount++;
            await (0, socket_handler_1.addISocketMount)(stat, route);
        }
        else if ((route === null || route === void 0 ? void 0 : route.__ihandler) == "ijob") {
            found.ijob++;
            await (0, job_handler_1.addIJobRoute)(stat, route);
        }
        else if ((route === null || route === void 0 ? void 0 : route.__ihandler) == "isub") {
            found.isub++;
            await (0, sub_handler_1.addISubRoute)(stat, route);
        }
    }
    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        if ((route === null || route === void 0 ? void 0 : route.__ihandler) == "ihttp") {
            found.ihttp++;
            await (0, http_handlers_1.addIHttpRoute)(stat.router, stat, route);
        }
        else if ((route === null || route === void 0 ? void 0 : route.__ihandler) == "isocket") {
            found.isocket++;
            await (0, socket_handler_1.addISocketRoute)(stat, route);
        }
        else if ((route === null || route === void 0 ? void 0 : route.__ihandler) == "icore") {
            found.icore++;
            await (0, core_handler_1.addICoreRoute)(stat, route);
        }
        else {
            found.icom++;
        }
    }
    return found;
};
const loadRouteModule = async (stat) => {
    const module = await Promise.resolve(`${stat.fullPath}`).then(s => __importStar(require(s)));
    const routes = Object.keys(module).filter((n) => n != "default");
    return routes.map((r) => module[r]);
};
