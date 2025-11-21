import React, {useState} from "react";
import {ContextMenu, ContextMenuContent, ContextMenuTrigger,} from "~/components/ui/context-menu";
import ColumnItemContextMenu from "~/routes/sites//SitesBrowser/ColumnItemContextMenu";
import {FaChevronRight, FaFile, FaFileLines, FaFolder, FaGlobe} from "react-icons/fa6";
import {NodeType, type ScrNode} from "@aemm/common";

interface ColumnItemProps {
  item: ScrNode & { path: string };
  onClick: (e: React.MouseEvent) => void;
  selectedChildPath: string | undefined;
}

function mapNodeTypeToIcon(type: NodeType) {
    switch (type) {
      case NodeType.FOLDER:
        return FaFolder;
      case NodeType.FILE:
        return FaFileLines;
      case NodeType.PAGE:
        return FaFile;
      case NodeType.SITE:
        return FaGlobe;
      default:
        throw type
    }
}

export default function ColumnItem(props: ColumnItemProps) {
  const isSelected = props.selectedChildPath === props.item.path;
  const hasChildren = props.item.children && props.item.children.length > 0;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    props.onClick(e);
  };

  const handleCreateNode = (name: string, type: NodeType, file?: File) => {
    console.log("Creating node:", { name, type, parentPath: props.item.path, file: file?.name });
    // TODO: Implement actual node creation
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={`
              flex items-center px-3 py-3 cursor-pointer
              transition-colors duration-50
              hover:bg-slate-100
              ${isSelected ? 'bg-slate-200' : ''}
            `}
            onClick={handleClick}
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-8 mr-2">
                {React.createElement(mapNodeTypeToIcon(props.item.type))}
            </div>

          {/* Name/Title */}
          <div className="flex-1 text-sm text-slate-900 truncate">
            {props.item.title || props.item.name}
          </div>

          {/* Chevron for folders */}
          {hasChildren && (
            <div className="flex items-center justify-center w-5 ml-2">
              <FaChevronRight className="text-slate-400" size={12} />
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ColumnItemContextMenu
          onNew={() => setCreateDialogOpen(true)}
          canCreateChildren={props.item.type !== NodeType.FILE}
        />
      </ContextMenuContent>
      </ContextMenu>
    </>
  );
}
