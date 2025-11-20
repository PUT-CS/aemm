import {useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import Column from "~/routes/sites/SitesBrowser/Column";
import {useQuery} from "@tanstack/react-query";
import fetchPathContent from "~/routes/sites/SitesBrowser/fetchPathContent";
import SitesToolbar from "~/routes/sites/SitesToolbar";

export default function SiteBrowser() {
  const navigate = useNavigate();
  const params = useParams();
  const urlPath = params["*"] || "";

  const [selectedPath, setSelectedPath] = useState<string>(
    urlPath ? `/${urlPath}` : "/",
  );

  useEffect(() => {
    setSelectedPath(urlPath ? `/${urlPath}` : "/");
  }, [urlPath]);

  const { data: selectedPathData } = useQuery({
    queryKey: ["content", selectedPath],
    queryFn: () => fetchPathContent(selectedPath),
    enabled: !!selectedPath,
  });

  const buildColumnPaths = (path: string): string[] => {
    if (!path || path === "/") {
      return ["/"];
    }

    const segments = path.split("/").filter((s) => s !== "");
    return ["/"].concat(
      segments.map((_, idx) => "/" + segments.slice(0, idx + 1).join("/")),
    );
  };

  const allPaths = buildColumnPaths(selectedPath);
  const hasChildren = selectedPathData?.children?.length > 0;
  const columnPaths = hasChildren ? allPaths : allPaths.slice(0, -1);

  const handleItemClick = (itemPath: string) => {
    setSelectedPath(itemPath);
    const urlSegment = itemPath === "/" ? "" : itemPath.substring(1);
    navigate(`/sites/${urlSegment}`, { replace: true });
  };

  return (
    <div className="h-full flex flex-col">
      <SitesToolbar
        selectedPath={selectedPath}
        selectedPathData={selectedPathData}
      />
      <div className="flex-1 flex overflow-x-auto border-l-0">
        {columnPaths.map((columnPath, index) => {
          const nextPath = allPaths[index + 1];
          return (
            <Column
              key={columnPath}
              path={columnPath}
              selectedChildPath={nextPath}
              onItemClick={handleItemClick}
            />
          );
        })}
      </div>
    </div>
  );
}
