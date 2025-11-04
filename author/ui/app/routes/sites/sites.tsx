import SiteBrowser from "~/routes/sites/SiteBrowser";

export function meta() {
  return [{ title: "Sites | AEMM" }];
}

export default function Sites() {
  return (
    <div>
      <SiteBrowser />
    </div>
  );
}
