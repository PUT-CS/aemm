import { FaChevronRight, FaFileLines } from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import fetchPathContent from "~/routes/sites/fetchPathContent";
import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import ColumnItemContextMenu from "~/routes/sites/ColumnItemContextMenu";

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
    props.selectedChildPath === props.item.path ? "bg-gray-300" : "";

  const hasChildren = data && data.children && data.children.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    props.onClick(e);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={`flex p-4 hover:bg-gray-100 cursor-pointer ${bgColorClass}`}
          onClick={handleClick}
        >
          <FaFileLines className="w-1/6" size="20" />
          <a className="text-sm">{props.item.name}</a>
          <div className="flex-1" />
          {isLoading && <span className="text-xs text-gray-500">...</span>}
          {isError && <span className="text-xs text-red-500">Error</span>}
          {hasChildren && (
            <span className="flex items-center text-xs text-gray-500">
              <FaChevronRight />
            </span>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ColumnItemContextMenu />
      </ContextMenuContent>
    </ContextMenu>
  );
}
