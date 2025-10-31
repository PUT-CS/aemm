import {type RouteConfig, index, layout, route} from "@react-router/dev/routes";

export default [
    layout("routes/rootLayout.tsx", [
        index("routes/home/home.tsx"),
        route("admin", "routes/admin/admin.tsx"),
        route("sites","routes/sites/sites.tsx"),
        route("editor","routes/editor/editor.tsx"),
    ]),
    layout('components/aemm/CenteredLayout.tsx', [
        route("login","routes/login.tsx"),
        route("*","routes/notFound.tsx"),
    ])
] satisfies RouteConfig;
