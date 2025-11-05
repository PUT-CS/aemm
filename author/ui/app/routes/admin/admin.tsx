import type { Route } from "../+types/login";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Administration | AEMM" }];
}

export default function Admin() {
  return <div>Admin Page</div>;
}
