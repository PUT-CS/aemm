import type { DialogProps } from "~/routes/sites/dialogs/dialog.types";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { NodeType, type Page, type Timestamps } from "@aemm/common";
import { AutoForm } from "~/lib/form-builder";
import { buildTextDescription } from "~/components/authoring/utils";
import { createNode, editNode } from "~/routes/sites/dialogs/mutations";

type PagePayload = Omit<Page, keyof Timestamps>;

const newPageSchema = z.object({
  name: z
    .string()
    .min(1, "Page name is required")
    .describe(
      buildTextDescription(
        "plainText",
        "Internal name of the page, used in URLs and file paths.",
      ),
    ),
  title: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Optional display title for the page. If not set, the name is used.",
      ),
    ),
  description: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Optional description for the page. Will appear in metadata and search results.",
      ),
    ),
  pageTemplatePath: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Path to a page template to base this page on.",
      ),
    ),
});

export default function NewPageDialog({
  parentPath,
  onClose,
  existingNode,
  nodePath,
}: DialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!existingNode && !!nodePath;
  const existingPage = existingNode as Page | undefined;

  const uploadMutation = useMutation({
    mutationFn: (node: Page | PagePayload) => {
      if (isEditMode && nodePath) {
        return editNode(nodePath, node as Page);
      } else {
        return createNode(parentPath, node as PagePayload);
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

  const onSubmit = (data: z.infer<typeof newPageSchema>) => {
    if (isEditMode && existingPage) {
      // Preserve all existing fields when editing
      const updatedPageNode: Page = {
        ...existingPage,
        ...data,
      };
      uploadMutation.mutate(updatedPageNode);
    } else {
      const newPageNode: PagePayload = {
        type: NodeType.PAGE,
        components: [],
        ...data,
      };
      uploadMutation.mutate(newPageNode);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditMode ? "Edit Page" : "Create Page"}</DialogTitle>
        <DialogDescription>
          {isEditMode
            ? `Editing page at ${nodePath}`
            : `It will be available under ${parentPath}`}
        </DialogDescription>
      </DialogHeader>
      <AutoForm
        schema={newPageSchema}
        defaultValues={
          isEditMode
            ? {
                name: existingPage?.name || "",
                title: existingPage?.title,
                description: existingPage?.description,
                pageTemplatePath: existingPage?.pageTemplatePath,
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
