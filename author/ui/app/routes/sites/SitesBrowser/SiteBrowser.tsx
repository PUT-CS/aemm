import {useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import Column from "~/routes/sites/SitesBrowser/Column";
import {useQuery} from "@tanstack/react-query";
import fetchTree from "~/routes/sites/SitesBrowser/fetchTree";
import SitesToolbar from "~/routes/sites/SitesToolbar";
import type {ScrNode} from "@aemm/common";

// Helper to find a node at a given path in the tree
function findNodeAtPath(tree: ScrNode | undefined, path: string): ScrNode | undefined {
  if (!tree) return undefined;
  if (path === "/") return tree;

  const segments = path.split("/").filter((s) => s !== "");
  let current: ScrNode | undefined = tree;

  for (const segment of segments) {
    if (!current?.children) return undefined;
    current = current.children.find((child) => child.name === segment);
    if (!current) return undefined;
  }

  return current;
}

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

  // Fetch the entire tree once
  const { data: tree } = useQuery({
    queryKey: ["tree"],
    queryFn: fetchTree,
  });

  const selectedPathData = findNodeAtPath(tree, selectedPath);

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
  const hasChildren = selectedPathData?.children && selectedPathData.children.length > 0;
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
              tree={tree}
              selectedChildPath={nextPath}
              onItemClick={handleItemClick}
            />
          );
        })}
      </div>
    </div>
  );
}
