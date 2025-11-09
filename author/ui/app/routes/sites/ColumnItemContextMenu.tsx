import { FaCopy, FaEdit, FaEye, FaTrash } from "react-icons/fa";
import ContextMenuOption from "~/routes/sites/ContextMenuOption";
import { ContextMenuSeparator } from "~/components/ui/context-menu";
import { FaPaste, FaPlus } from "react-icons/fa6";

export default function ColumnItemContextMenu() {
  return (
    <>
      <ContextMenuOption
        icon={FaPlus}
        label="New"
        onClick={() => console.log("Create")}
      />
      <ContextMenuOption
        icon={FaEye}
        label="Preview"
        onClick={() => console.log("Preview")}
      />
      <ContextMenuOption
        icon={FaEdit}
        label="Edit"
        onClick={() => console.log("Edit")}
      />
      <ContextMenuSeparator />
      <ContextMenuOption
        icon={FaCopy}
        label="Copy"
        onClick={() => console.log("Copy")}
      />
      <ContextMenuOption
        icon={FaPaste}
        label="Paste"
        onClick={() => console.log("Paste")}
      />
      <ContextMenuSeparator />
      <ContextMenuOption
        icon={FaTrash}
        label="Delete"
        kind="destructive"
        onClick={() => console.log("Delete")}
      />
    </>
  );
}
