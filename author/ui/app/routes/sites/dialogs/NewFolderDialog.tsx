import type { DialogProps } from "~/routes/sites/dialogs/dialog.types";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { NodeType, type ScrNodeWithoutTimestamps } from "@aemm/common";
import { uploadNode } from "./mutations";
import { AutoForm } from "~/lib/form-builder";
import { buildTextDescription } from "~/components/authoring/utils";

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

export default function NewFolderDialog({ parentPath, onClose }: DialogProps) {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (node: ScrNodeWithoutTimestamps) =>
      uploadNode(parentPath, node),
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
    const newFolderNode: ScrNodeWithoutTimestamps = {
      type: NodeType.FOLDER,
      ...data,
    };
    uploadMutation.mutate(newFolderNode);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Folder</DialogTitle>
        <DialogDescription>
          It will be available under {parentPath}
        </DialogDescription>
      </DialogHeader>
      <AutoForm
        schema={newFolderSchema}
        defaultValues={{ name: "" }}
        onSubmit={onSubmit}
        submitLabel="Create"
        isSubmitting={uploadMutation.isPending}
      />
    </>
  );
}
