import type { DialogProps } from "~/routes/sites/dialogs/dialog.types";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  type Folder,
  NodeType,
  type ScrNode,
  type ScrNodeWithoutTimestamps,
} from "@aemm/common";
import { AutoForm } from "~/lib/form-builder";
import { buildTextDescription } from "~/components/authoring/utils";
import { createNode, editNode } from "~/routes/sites/dialogs/mutations";

const newFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .describe(
      buildTextDescription(
        "plainText",
        "Internal name of the folder, used in URLs and file paths.",
      ),
    ),
  title: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Optional display title for the folder. If not set, the name is used.",
      ),
    ),
});

export default function NewFolderDialog({
  parentPath,
  onClose,
  existingNode,
  nodePath,
}: DialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!existingNode && !!nodePath;
  const existingFolder = existingNode as Folder | undefined;

  const uploadMutation = useMutation({
    mutationFn: (node: ScrNode | ScrNodeWithoutTimestamps) => {
      if (isEditMode && nodePath) {
        return editNode(nodePath, node as ScrNode);
      } else {
        return createNode(parentPath, node as ScrNodeWithoutTimestamps);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      onClose?.();
    },
    onError: (error: Error) => {
      console.error("Node upload failed:", error);
      alert(`Node upload failed: ${error.message}`);
    },
  });

  const onSubmit = (data: z.infer<typeof newFolderSchema>) => {
    if (isEditMode && existingFolder) {
      // Preserve all existing fields when editing
      const updatedFolderNode: Folder = {
        ...existingFolder,
        ...data,
      };
      uploadMutation.mutate(updatedFolderNode);
    } else {
      const newFolderNode: ScrNodeWithoutTimestamps = {
        id: "",
        type: NodeType.FOLDER,
        ...data,
      };
      uploadMutation.mutate(newFolderNode);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditMode ? "Edit Folder" : "Create Folder"}
        </DialogTitle>
        <DialogDescription>
          {isEditMode
            ? `Editing folder at ${nodePath}`
            : `It will be available under ${parentPath}`}
        </DialogDescription>
      </DialogHeader>
      <AutoForm
        schema={newFolderSchema}
        defaultValues={
          isEditMode
            ? {
                name: existingFolder?.name || "",
                title: existingFolder?.title,
              }
            : { name: "" }
        }
        onSubmit={onSubmit}
        submitLabel={isEditMode ? "Update" : "Create"}
        isSubmitting={uploadMutation.isPending}
      />
    </>
  );
}
