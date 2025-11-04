import { FaChevronRight, FaFileLines } from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import fetchPathContent from "~/routes/sites/fetchPathContent";
import React from "react";

export default function ColumnItem(props: {
  item: any;
  onClick: (e: React.MouseEvent) => void;
  selectedChildPath: string | undefined;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["content", props.item.path],
    queryFn: () => fetchPathContent(props.item.path),
  });

  const bgColorClass =
    props.selectedChildPath === props.item.path ? "bg-blue-200" : "";

  const hasChildren = data && data.children && data.children.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      props.onClick(e);
    }
  };

  return (
    <div
      className={`flex p-4 hover:bg-blue-100 cursor-pointer ${bgColorClass}`}
      onClick={handleClick}
    >
      <FaFileLines className="w-1/6" size="20" />
      <a className="text-sm">{props.item.name}</a>
      <div className="flex-1" />
      {isLoading && <span className="text-xs text-gray-500">...</span>}
      {isError && <span className="text-xs text-red-500">Error</span>}
      {hasChildren && (
        <span className="text-xs text-gray-500">
          <FaChevronRight />
        </span>
      )}
    </div>
  );
}
