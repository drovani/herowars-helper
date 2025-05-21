import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";
import log from "loglevel";
log.enableAll();

export default flatRoutes() satisfies RouteConfig;