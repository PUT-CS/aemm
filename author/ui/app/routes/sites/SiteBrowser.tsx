import { useNavigate, useParams } from "react-router";
import Column from "~/routes/sites/Column";
import { useQuery } from "@tanstack/react-query";
import fetchPathContent from "~/routes/sites/fetchPathContent";

export default function SiteBrowser() {
  const navigate = useNavigate();
  const params = useParams();

  const currentPath = params["*"] || "";

  const buildColumnPaths = (path: string): string[] => {
    if (!path || path === "") {
      return ["/"];
    }

    const segments = path.split("/").filter((s) => s !== "");
    return ["/"].concat(
      segments.map((_, idx) => "/" + segments.slice(0, idx + 1).join("/")),
    );
  };

  const allPaths = buildColumnPaths(currentPath);
  const lastPath = allPaths[allPaths.length - 1];

  const { data: lastPathData } = useQuery({
    queryKey: ["content", lastPath],
    queryFn: () => fetchPathContent(lastPath),
    enabled: !!lastPath,
  });

  const hasChildren =
    lastPathData && lastPathData.children && lastPathData.children.length > 0;

  const columnPaths = hasChildren ? allPaths : allPaths.slice(0, -1);

  const handleItemClick = (itemPath: string) => {
    navigate(`/sites${itemPath}`);
  };

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Site Browser</h1>
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
