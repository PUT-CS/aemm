import React, { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import ColumnItemContextMenu from "~/routes/sites//SitesBrowser/ColumnItemContextMenu";
import {
  FaChevronRight,
  FaFile,
  FaFileLines,
  FaFolderOpen,
  FaGlobe,
} from "react-icons/fa6";
import { NodeType, type ScrNode } from "@aemm/common";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import NewSiteDialog from "~/routes/sites/dialogs/NewSiteDialog";
import NewPageDialog from "~/routes/sites/dialogs/NewPageDialog";
import NewFolderDialog from "~/routes/sites/dialogs/NewFolderDialog";
import FileUploadDialog from "~/routes/sites/dialogs/FileUploadDialog";
import DeleteNodeDialog from "~/routes/sites/dialogs/DeleteNodeDialog";

interface ColumnItemProps {
  item: ScrNode & { children?: unknown[] };
  itemPath: string;
  onClick: (e: React.MouseEvent) => void;
  selectedChildPath?: string;
}

function mapNodeTypeToIcon(type: NodeType) {
  switch (type) {
    case NodeType.FOLDER:
      return FaFolderOpen;
    case NodeType.FILE:
      return FaFileLines;
    case NodeType.PAGE:
      return FaFile;
    case NodeType.SITE:
      return FaGlobe;
    default:
      throw type;
  }
}

export default function ColumnItem({
  item,
  itemPath,
  onClick,
  selectedChildPath,
}: ColumnItemProps) {
  const isSelected = selectedChildPath === itemPath;
  const hasChildren = item.children && item.children.length > 0;

  const [activeDialog, setActiveDialog] = useState<NodeType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    onClick(e);
  };

  const handleCloseDialog = () => {
    setActiveDialog(null);
    setIsEditMode(false);
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setActiveDialog(item.type);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={`flex items-center gap-2 px-3 h-16 cursor-pointer transition-colors hover:bg-slate-100 ${isSelected ? "bg-slate-200" : ""}`}
            onClick={handleClick}
          >
            {/* Icon */}
            <div className="w-8 flex justify-center">
              {React.createElement(mapNodeTypeToIcon(item.type))}
            </div>

            {/* Name/Title */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
              {item.title ? (
                <>
                  <span className="text-sm text-slate-900 truncate">
                    {item.title}
                  </span>
                  <span className="text-xs text-slate-500 truncate">
                    {item.name}
                  </span>
                </>
              ) : (
                <span className="text-sm text-slate-900 truncate">
                  {item.name}
                </span>
              )}
            </div>

            {/* Chevron */}
            {hasChildren && (
              <FaChevronRight className="text-slate-400" size={12} />
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ColumnItemContextMenu
            onNewSite={() => setActiveDialog(NodeType.SITE)}
            onNewPage={() => setActiveDialog(NodeType.PAGE)}
            onNewFolder={() => setActiveDialog(NodeType.FOLDER)}
            onNewFileUpload={() => setActiveDialog(NodeType.FILE)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canCreateChildren={item.type !== NodeType.FILE}
          />
        </ContextMenuContent>
      </ContextMenu>
      <Dialog
        open={activeDialog !== null}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent>
          {activeDialog === NodeType.SITE && (
            <NewSiteDialog
              parentPath={itemPath}
              onClose={handleCloseDialog}
              existingNode={isEditMode ? item : undefined}
              nodePath={isEditMode ? itemPath : undefined}
            />
          )}
          {activeDialog === NodeType.PAGE && (
            <NewPageDialog
              parentPath={itemPath}
              onClose={handleCloseDialog}
              existingNode={isEditMode ? item : undefined}
              nodePath={isEditMode ? itemPath : undefined}
            />
          )}
          {activeDialog === NodeType.FOLDER && (
            <NewFolderDialog
              parentPath={itemPath}
              onClose={handleCloseDialog}
              existingNode={isEditMode ? item : undefined}
              nodePath={isEditMode ? itemPath : undefined}
            />
          )}
          {activeDialog === NodeType.FILE && (
            <FileUploadDialog
              parentPath={itemPath}
              onClose={handleCloseDialog}
            />
          )}
        </DialogContent>
      </Dialog>
      <DeleteNodeDialog
        open={showDeleteDialog}
        nodePath={itemPath}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
