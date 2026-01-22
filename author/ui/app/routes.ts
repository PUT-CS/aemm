import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  route("preview/*", "routes/preview/preview.tsx"),
  route("login", "routes/login.tsx"),
  layout("routes/protectedLayout.tsx", [
    index("routes/home/home.tsx"),
    route("admin", "routes/admin/admin.tsx"),
    route("sites/*", "routes/sites/sites.tsx"),
    route("editor/*", "routes/editor/editor.tsx"),
    route("demo", "routes/demo/demo.tsx"),
  ]),
  layout("components/aemm/CenteredLayout.tsx", [
    route("*", "routes/notFound.tsx"),
  ]),
] satisfies RouteConfig;
