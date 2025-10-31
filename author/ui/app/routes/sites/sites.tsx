import type { Route } from "../+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sites | AEMM" }
  ];
}

export default function Sites() {
  return <div>Sites Page</div>;
}