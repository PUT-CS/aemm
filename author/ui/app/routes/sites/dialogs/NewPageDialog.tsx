import type { DialogProps } from "~/routes/sites/dialogs/dialog.types";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { NodeType, type Page, type Timestamps } from "@aemm/common";
import { uploadNode } from "./mutations";
import { AutoForm } from "~/lib/form-builder";
import { buildTextDescription } from "~/components/authoring/utils";

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

export default function NewPageDialog({ parentPath, onClose }: DialogProps) {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (node: PagePayload) => uploadNode(parentPath, node),
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
    const newPageNode: PagePayload = {
      type: NodeType.PAGE,
      ...data,
      components: [],
    };
    uploadMutation.mutate(newPageNode);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Page</DialogTitle>
        <DialogDescription>
          It will be available under {parentPath}
        </DialogDescription>
      </DialogHeader>
      <AutoForm
        schema={newPageSchema}
        defaultValues={{ name: "" }}
        onSubmit={onSubmit}
        submitLabel="Create"
        isSubmitting={uploadMutation.isPending}
      />
    </>
  );
}
