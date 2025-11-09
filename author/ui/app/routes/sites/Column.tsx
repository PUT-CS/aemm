import { useQuery } from "@tanstack/react-query";
import ColumnItem from "~/routes/sites/ColumnItem";
import React from "react";
import fetchPathContent from "~/routes/sites/fetchPathContent";

interface ColumnProps {
  path: string;
  selectedChildPath?: string;
  onItemClick: (itemPath: string) => void;
}

export default function Column({
  path,
  selectedChildPath,
  onItemClick,
}: ColumnProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["content", path],
    queryFn: () => fetchPathContent(path),
  });

  const handleClick = (itemPath: string) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      onItemClick(itemPath);
    };
  };

  if (isLoading) {
    return <div className="border border-l-0 border-t-0 min-w-[250px]"></div>;
  }

  return (
    <div className="border border-l-0 border-t-0 min-w-[250px]">
      {isError && (
        <div className="text-sm text-red-500">Error loading content</div>
      )}
      {data && data.children && (
        <div>
          {/* eslint-disable-next-line */}
          {data.children.map((item: any) => (
            <ColumnItem
              key={item.path}
              item={item}
              onClick={handleClick(item.path)}
              selectedChildPath={selectedChildPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}
