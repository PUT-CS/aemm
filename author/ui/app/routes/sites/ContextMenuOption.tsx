import { ContextMenuItem } from "~/components/ui/context-menu";
import type { IconType } from "react-icons";

type OptionKind = "default" | "destructive";

interface ContextMenuOptionProps {
  icon: IconType;
  label: string;
  kind?: OptionKind;
  onClick?: () => void;
}

export default function ContextMenuOption({
  icon: Icon,
  label,
  kind = "default",
  onClick,
}: ContextMenuOptionProps) {
  const textColorClass =
    kind === "destructive" ? "text-red-600" : "text-gray-900";
  return (
    <ContextMenuItem onClick={onClick} className={`${textColorClass}`}>
      <div className={`flex items-center gap-2 w-full`}>
        <Icon
          className="w-4 h-4"
          color={kind === "destructive" ? "red" : "gray"}
        />
        <span className={`${textColorClass}`}>{label}</span>
      </div>
    </ContextMenuItem>
  );
}
