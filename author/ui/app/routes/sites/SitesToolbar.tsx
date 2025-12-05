import type { IconType } from "react-icons";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { type ScrNode } from "@aemm/common";

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

function ToolbarIcon({
  icon: Icon,
  label,
  onClick,
  disabled = false,
}: ToolbarIconProps) {
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

export default function SitesToolbar({ selectedPathData }: SitesToolbarProps) {
  return (
    <>
      <div className="flex border-b h-12 items-center px-4 bg-white">
        <div className="flex-1"></div>
        <div className="text-sm font-semibold text-slate-900">
          {selectedPathData?.title ?? selectedPathData?.name}
        </div>
        <div className="flex-1"></div>
      </div>
    </>
  );
}
