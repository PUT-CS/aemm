import type { Route } from "../+types/login";
import SiteBrowser from "~/routes/sites/SiteBrowser";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sites | AEMM" }];
}

export default function Sites() {
  return (
    <div className="h-full">
      <SiteBrowser />
    </div>
  );
}
