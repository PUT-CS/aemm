import { FaEdit } from "react-icons/fa";
import {
  FaCopy,
  FaEye,
  FaFile,
  FaFolderOpen,
  FaGlobe,
  FaPaste,
  FaPenToSquare,
  FaPlus,
  FaTrash,
  FaUpload,
} from "react-icons/fa6";
import ContextMenuOption from "~/routes/sites/SitesBrowser/ContextMenuOption";
import {
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "~/components/ui/context-menu";
import { NodeType } from "@aemm/common";

interface ColumnItemContextMenuProps {
  onNewSite: () => void;
  onNewPage: () => void;
  onNewFolder: () => void;
  onNewFileUpload: () => void;
  onEditProperties: () => void;
  onEditContent: () => void;
  onPreview: () => void;
  onDelete: () => void;
  canCreateChildren: boolean;
  nodeType: NodeType;
}

export default function ColumnItemContextMenu({
  onNewSite,
  onNewPage,
  onNewFolder,
  onNewFileUpload,
  onEditProperties,
  onEditContent,
  onPreview,
  onDelete,
  canCreateChildren,
  nodeType,
}: ColumnItemContextMenuProps) {
  const isPage = nodeType === NodeType.PAGE;

  return (
    <>
      {canCreateChildren && (
        <>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <div className={`flex items-center gap-2 w-full`}>
                <FaPlus />
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
          <ContextMenuSeparator />
        </>
      )}
      <ContextMenuOption icon={FaEye} label="Preview" onClick={onPreview} />
      {isPage && (
        <ContextMenuOption
          icon={FaPenToSquare}
          label="Edit Content"
          onClick={onEditContent}
        />
      )}
      <ContextMenuOption
        icon={FaEdit}
        label="Edit Properties"
        onClick={onEditProperties}
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
        variant="destructive"
        onClick={onDelete}
      />
    </>
  );
}
