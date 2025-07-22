import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";
import log from "loglevel";
log.enableAll();

export default [
  index("./routes/views/public/index.tsx"),
  route("auth/confirm", "./routes/views/auth/confirm.tsx"),
  route("auth/error", "./routes/views/auth/error.tsx"),
  route("login", "./routes/views/auth/login.tsx"),
  route("logout", "./routes/views/public/logout.tsx"),
  route("forgot-password", "./routes/views/auth/forgot-password.tsx"),
  route("update-password", "./routes/views/auth/update-password.tsx"),
  route("sign-up", "./routes/views/auth/sign-up.tsx"),
  route("api/admin/users", "./routes/resources/api/admin/users.tsx"),
  ...prefix("admin", [
    layout("./layouts/ProtectedAdminLayout.tsx", [
      route("setup", "./routes/views/admin/setup.tsx"),
      route("users", "./routes/views/admin/users.tsx"),
      route("test-coverage", "./routes/views/admin/test-coverage.tsx"),
      index("./routes/views/admin/index.tsx"),
    ]),
  ]),
  layout("./layouts/ProtectedUserLayout.tsx", [
    route("account", "./routes/views/account/index.tsx", [
      index("./routes/views/account/profile.tsx"),
    ]),
    route("player", "./routes/views/player/layout.tsx", [
      index("./routes/views/player/index.tsx"),
      route("roster", "./routes/views/player/roster.tsx"),
      route("activity", "./routes/views/player/activity.tsx"),
      route("teams", "./routes/views/player/teams/index.tsx"),
      route("teams/new", "./routes/views/player/teams/new.tsx"),
      route("teams/:teamId", "./routes/views/player/teams/$teamId.edit.tsx"),
    ]),
  ]),
  route("protected", "./routes/views/public/protected.tsx"),
  route("heroes", "./routes/views/heroes/layout.tsx", [
    index("./routes/views/heroes/index.tsx"),
    route(":slug", "./routes/views/heroes/slug.tsx"),
    route(":slug.json", "./routes/views/heroes/slug.json.tsx"),
  ]),
  route("titans", "./routes/views/titans/layout.tsx", [
    index("./routes/views/titans/index.tsx"),
  ]),
  route("equipment", "./routes/views/equipment/layout.tsx", [
    index("./routes/views/equipment/index.tsx"),
    route(":slug", "./routes/views/equipment/slug.tsx"),
  ]),
  route("missions", "./routes/views/missions/layout.tsx", [
    index("./routes/views/missions/index.tsx"),
    route(":slug", "./routes/views/missions/slug.tsx"),
  ]),
  layout("./layouts/ProtectedEditorLayout.tsx", [
    route("heroes/:slug/edit", "./routes/views/heroes/slug.edit.tsx"),
    route("equipment/:slug/edit", "./routes/views/equipment/slug.edit.tsx"),
    route("equipment/new", "./routes/views/equipment/new.tsx"),
    route("missions/:slug/edit", "./routes/views/missions/slug.edit.tsx"),
  ]),
  route("missions.json", "./routes/views/missions/json.tsx"),
  route("equipment.json", "./routes/views/equipment/json.tsx"),
  route("heroes.json", "./routes/views/heroes/json.tsx"),
] satisfies RouteConfig;
