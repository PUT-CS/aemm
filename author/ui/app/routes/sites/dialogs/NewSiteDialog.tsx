import type { DialogProps } from "~/routes/sites/dialogs/dialog.types";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { NodeType, type Site, type Timestamps } from "@aemm/common";
import { AutoForm } from "~/lib/form-builder";
import { buildTextDescription } from "~/components/authoring/utils";
import { createNode, editNode } from "~/routes/sites/dialogs/mutations";

type SitePayload = Omit<Site, keyof Timestamps>;

const newSiteSchema = z.object({
  name: z
    .string()
    .min(1, "Site name is required")
    .describe(
      buildTextDescription(
        "plainText",
        "Internal name of the site, used in URLs and file paths.",
      ),
    ),
  title: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Optional display title for the site. If not set, the name is used.",
      ),
    ),
  description: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Optional description for the site. Will appear in metadata and search results.",
      ),
    ),
  defaultPageTemplatePath: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Path to a page template that will be used by default for all pages in this site.",
      ),
    ),
});

export default function NewSiteDialog({
  parentPath,
  onClose,
  existingNode,
  nodePath,
}: DialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!existingNode && !!nodePath;
  const existingSite = existingNode as Site | undefined;

  const uploadMutation = useMutation({
    mutationFn: (node: Site | SitePayload) => {
      if (isEditMode && nodePath) {
        return editNode(nodePath, node as Site);
      } else {
        return createNode(parentPath, node as SitePayload);
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

  const onSubmit = (data: z.infer<typeof newSiteSchema>) => {
    if (isEditMode && existingSite) {
      // Preserve all existing fields when editing
      const updatedSiteNode: Site = {
        ...existingSite,
        ...data,
      };
      uploadMutation.mutate(updatedSiteNode);
    } else {
      const newSiteNode: SitePayload = {
        type: NodeType.SITE,
        ...data,
      };
      uploadMutation.mutate(newSiteNode);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditMode ? "Edit Site" : "Create Site"}</DialogTitle>
        <DialogDescription>
          {isEditMode
            ? `Editing site at ${nodePath}`
            : `It will be available under ${parentPath}`}
        </DialogDescription>
      </DialogHeader>
      <AutoForm
        schema={newSiteSchema}
        defaultValues={
          isEditMode
            ? {
                name: existingSite?.name || "",
                title: existingSite?.title,
                description: existingSite?.description,
                defaultPageTemplatePath: existingSite?.defaultPageTemplatePath,
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
