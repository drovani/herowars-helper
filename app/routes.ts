import { index, layout, prefix, route, type RouteConfig } from "@react-router/dev/routes";
import log from "loglevel";
log.enableAll();

export default [
  index("./routes/_index.tsx"),
  route("heroes", "./routes/heroes.tsx", [
    index("./routes/heroes._index.tsx"),
    route(":slug", "./routes/heroes.$slug.tsx"),
    route(":slug.json", "./routes/heroes.$slug[.json].tsx"),
    route(":slug/edit", "./routes/heroes.$slug_.edit.tsx"),
  ]),
  route("titans", "./routes/titans.tsx", [index("./routes/titans._index.tsx")]),
  route("equipment", "./routes/equipment.tsx", [
    index("./routes/equipment._index.tsx"),
    route(":slug", "./routes/equipment.$slug.tsx"),
    route(":slug/edit", "./routes/equipment.$slug_.edit.tsx"),
    route("new", "./routes/equipment.new.tsx"),
  ]),
  route("missions", "./routes/missions.tsx", [
    index("./routes/missions._index.tsx"),
    route(":missionId", "./routes/missions.$missionId.tsx"),
  ]),
  route("missions.json", "./routes/missions[.json].tsx"),
  route("equipment.json", "./routes/equipment[.json].tsx"),
  route("heroes.json", "./routes/heroes[.json].tsx"),
  route("auth/confirm", "./routes/auth.confirm.tsx"),
  route("auth/error", "./routes/auth.error.tsx"),
  route("login", "./routes/login.tsx"),
  route("logout", "./routes/logout.tsx"),
  route("forgot-password", "./routes/forgot-password.tsx"),
  route("update-password", "./routes/update-password.tsx"),
  route("sign-up", "./routes/sign-up.tsx"),
  ...prefix("admin", [
    layout("./layouts/ProtectedAdminLayout.tsx", [
      route("setup", "./routes/admin.setup.tsx"),
      route("/*", "./routes/admin.tsx"),
    ]),
  ]),
  layout("./layouts/ProtectedUserLayout.tsx", [
    route("account", "./routes/account.tsx", [index("./routes/account._index.tsx")]),
  ]),
] satisfies RouteConfig;
