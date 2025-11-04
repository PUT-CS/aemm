import { FaCopy, FaEdit, FaEye, FaTrash } from "react-icons/fa";
import ContextMenuOption from "~/routes/sites/ContextMenuOption";

export default function ColumnItemContextMenu() {
  return (
    <>
      <ContextMenuOption
        icon={FaEye}
        label="View"
        onClick={() => console.log("View")}
      />
      <ContextMenuOption
        icon={FaEdit}
        label="Edit"
        onClick={() => console.log("Edit")}
      />
      <ContextMenuOption
        icon={FaCopy}
        label="Copy"
        onClick={() => console.log("Copy")}
      />
      <ContextMenuOption
        icon={FaTrash}
        label="Delete"
        kind="destructive"
        onClick={() => console.log("Delete")}
      />
    </>
  );
}
