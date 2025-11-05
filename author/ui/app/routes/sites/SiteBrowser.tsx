import { useNavigate, useParams } from "react-router";
import Column from "~/routes/sites/Column";

export default function SiteBrowser() {
  const navigate = useNavigate();
  const params = useParams();

  // Get the current path from URL params (everything after /sites/)
  const currentPath = params["*"] || "";

  // Build an array of paths for each column to display
  // e.g., if currentPath is "aemm/pl/home", we show columns for: "/", "/aemm", "/aemm/pl", "/aemm/pl/home"
  const buildColumnPaths = (path: string): string[] => {
    if (!path || path === "") {
      return ["/"];
    }

    const segments = path.split("/").filter((s) => s !== "");
    return ["/"].concat(
      segments.map((_, idx) => "/" + segments.slice(0, idx + 1).join("/")),
    );
  };

  const columnPaths = buildColumnPaths(currentPath);

  const handleItemClick = (itemPath: string) => {
    // Navigate to the new path, which will be everything after /sites
    // itemPath is already the full path like "/aemm/pl"
    navigate(`/sites${itemPath}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Site Browser</h1>
      <div className="flex overflow-x-auto">
        {columnPaths.map((columnPath, index) => {
          // Determine if this column has a selected child
          const nextPath = columnPaths[index + 1];
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
