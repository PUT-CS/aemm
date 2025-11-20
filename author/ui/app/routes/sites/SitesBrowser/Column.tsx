import React from "react";
import ColumnItem from "~/routes/sites/SitesBrowser/ColumnItem";

interface ColumnProps {
  path: string;
  tree: any;
  selectedChildPath?: string;
  onItemClick: (itemPath: string) => void;
}

// Helper to find a node at a given path in the tree
function findNodeAtPath(tree: any, path: string): any {
  if (!tree) return null;
  if (path === "/") return tree;

  const segments = path.split("/").filter((s) => s !== "");
  let current = tree;

  for (const segment of segments) {
    if (!current.children) return null;
    current = current.children.find((child: any) => child.name === segment);
    if (!current) return null;
  }

  return current;
}

export default function Column({
  path,
  tree,
  selectedChildPath,
  onItemClick,
}: ColumnProps) {
  const data = findNodeAtPath(tree, path);

  const handleClick = (itemPath: string) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      onItemClick(itemPath);
    };
  };

  if (!tree) {
    return <div className="border border-l-0 border-t-0 min-w-[250px]"></div>;
  }

  return (
    <div className="border border-l-0 border-t-0 min-w-[250px]">
      {!data && (
        <div className="text-sm text-red-500">Error loading content</div>
      )}
      {data && data.children && (
        <div>
          {/* eslint-disable-next-line */}
          {data.children.map((item: any) => {
            // Construct the child path from parent path and item name
            const childPath = path === "/" ? `/${item.name}` : `${path}/${item.name}`;
            return (
              <ColumnItem
                key={childPath}
                item={{ ...item, path: childPath }}
                onClick={handleClick(childPath)}
                selectedChildPath={selectedChildPath}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
