import React from "react";
import ColumnItem from "~/routes/sites/SitesBrowser/ColumnItem";
import type {ScrNode} from "@aemm/common";

interface ColumnProps {
  path: string;
  tree: ScrNode | undefined;
  selectedChildPath?: string;
  onItemClick: (itemPath: string) => void;
}

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
          {data.children.map((item) => {
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
