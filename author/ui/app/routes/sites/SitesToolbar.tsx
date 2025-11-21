import type {IconType} from "react-icons";
import {FaCopy, FaPaste, FaPlus} from "react-icons/fa6";
import {Button} from "~/components/ui/button";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "~/components/ui/tooltip";
import {NodeType, type ScrNode} from "@aemm/common";
import {useState} from "react";

interface ToolbarIconProps {
  icon: IconType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface SitesToolbarProps {
  selectedPath?: string;
  selectedPathData?: ScrNode;
}

function ToolbarIcon({ icon: Icon, label, onClick, disabled = false }: ToolbarIconProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className="h-9 w-9 p-0 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon size={16} className="text-slate-700" />
            <span className="sr-only">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function SitesToolbar({ selectedPathData, selectedPath }: SitesToolbarProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Check if the selected node is a FILE (can't have children)
  const canCreateChildren = selectedPathData?.type !== NodeType.FILE;

  const handleCreateNode = (name: string, type: NodeType, file?: File) => {
    console.log("Creating node:", { name, type, parentPath: selectedPath, file: file?.name });
    // TODO: Implement actual node creation
  };

  return (
    <>
      <div className="flex border-b h-12 items-center px-4 bg-white">
        <div className="flex-1"></div>
        <div className="text-sm font-semibold text-slate-900">
          {selectedPathData?.title ?? selectedPathData?.name}
        </div>
        <div className="flex-1 flex items-center gap-1 justify-end">
          <ToolbarIcon icon={FaCopy} label="Copy" onClick={() => {}} />
          <ToolbarIcon icon={FaPaste} label="Paste" onClick={() => {}} />
          <ToolbarIcon
            icon={FaPlus}
            label="New"
            onClick={() => setCreateDialogOpen(true)}
            disabled={!canCreateChildren}
          />
        </div>
      </div>
    </>
  );
}
