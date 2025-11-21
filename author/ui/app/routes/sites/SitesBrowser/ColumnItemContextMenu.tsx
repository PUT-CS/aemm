import {FaCopy, FaEdit, FaEye, FaTrash} from "react-icons/fa";
import ContextMenuOption from "~/routes/sites/SitesBrowser/ContextMenuOption";
import {
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger
} from "~/components/ui/context-menu";
import {FaFile, FaFolderOpen, FaGlobe, FaPaste, FaPlus, FaUpload} from "react-icons/fa6";

interface ColumnItemContextMenuProps {
  onNewSite: () => void;
  onNewPage: () => void;
  onNewFolder: () => void;
  onNewFileUpload: () => void;
  canCreateChildren: boolean;
}

export default function ColumnItemContextMenu(
  {
    onNewSite,
    onNewPage,
    onNewFolder,
    onNewFileUpload,
    canCreateChildren
  }: ColumnItemContextMenuProps
) {
  return (
    <>
      {canCreateChildren && (
        <>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <div className={`flex items-center gap-2 w-full`}>
                <FaPlus/>
                <span>New</span>
              </div>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuOption
                icon={FaGlobe}
                label="Site"
                onClick={onNewSite}
              />
              <ContextMenuOption
                icon={FaFile}
                label="Page"
                onClick={onNewPage}
              />
              <ContextMenuOption
                icon={FaFolderOpen}
                label="Folder"
                onClick={onNewFolder}
              />
              <ContextMenuOption
                icon={FaUpload}
                label="File Upload"
                onClick={onNewFileUpload}
              />
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator/>
        </>
      )}
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
      <ContextMenuSeparator/>
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
      <ContextMenuSeparator/>
      <ContextMenuOption
        icon={FaTrash}
        label="Delete"
        variant="destructive"
        onClick={() => console.log("Delete")}
      />
    </>
  );
}
