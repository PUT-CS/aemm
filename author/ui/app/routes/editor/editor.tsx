import type { Route } from "../+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Editor | AEMM" }
  ];
}

export default function Editor() {
  return <div>Editor Page</div>;
}