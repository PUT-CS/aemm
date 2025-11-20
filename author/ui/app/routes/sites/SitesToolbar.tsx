import type {IconType} from "react-icons";
import type {ScrNode} from "@aemm/common";

interface ToolbarIconProps {
  icon: IconType;
  label: string;
  onClick: () => void;
}

interface SitesToolbarProps {
  selectedPath?: string;
  selectedPathData?: ScrNode;
}

function ToolbarIcon({ icon: Icon, label, onClick }: ToolbarIconProps) {
  return (
    <div
      onClick={onClick}
      className="flex-col items-center justify-center flex gap-1 cursor-pointer hover:text-slate-600 transition-colors"
    >
      <Icon size={18} />
      <div className="text-xs">{label}</div>
    </div>
  );
}

export default function SitesToolbar({ selectedPathData, selectedPath }: SitesToolbarProps) {
  return (
    <div className="flex border-b h-12 items-center px-4">
      <div className="flex-1"></div>
      <div className="text-sm font-medium">
        {selectedPathData?.title ?? selectedPathData?.name}
      </div>
      <div className="flex-1 flex items-center gap-4 justify-end">
        {/* Maybe will be enabled in the future */}
        {/*<ToolbarIcon icon={FaCopy} label={"Copy"} onClick={() => {}} />*/}
        {/*<ToolbarIcon icon={FaPaste} label={"Paste"} onClick={() => {}} />*/}
        {/*<ToolbarIcon icon={FaPlus} label="New" onClick={() => {}} />*/}
      </div>
    </div>
  );
}
