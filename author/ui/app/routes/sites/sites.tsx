import type { Route } from "../+types/login";
import SiteBrowser from "~/routes/sites/SitesBrowser/SiteBrowser";

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
