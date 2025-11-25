import React from "react";
import ColumnItem from "~/routes/sites/SitesBrowser/ColumnItem";
import { findNodeAtPath } from "~/routes/sites/SitesBrowser/treeUtils";
import type { ScrNodeWithChildren } from "@aemm/common";

interface ColumnProps {
  path: string;
  tree: ScrNodeWithChildren | undefined;
  selectedChildPath?: string;
  onItemClick: (itemPath: string) => void;
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
          {data.children.map((item: ScrNodeWithChildren) => {
            const childPath =
              path === "/" ? `/${item.name}` : `${path}/${item.name}`;
            return (
              <ColumnItem
                key={childPath}
                item={item}
                itemPath={childPath}
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
