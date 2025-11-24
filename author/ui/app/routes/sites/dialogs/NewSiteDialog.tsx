import type { DialogProps } from "~/routes/sites/dialogs/dialog.types";
import { Button } from "~/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { NodeType, type Site, type Timestamps } from "@aemm/common";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadNode } from "./mutations";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

type SitePayload = Omit<Site, keyof Timestamps>;

export default function NewSiteDialog({ parentPath, onClose }: DialogProps) {
  const queryClient = useQueryClient();

  const newSiteSchema = z.object({
    name: z.string().min(1, "Site name is required"),
    title: z.string().optional(),
    description: z.string().optional(),
    defaultPageTemplatePath: z.string().optional(),
  });
  const defaultValues: SitePayload = {
    type: NodeType.SITE,
    name: "",
  };

  const form = useForm<z.infer<typeof newSiteSchema>>({
    resolver: zodResolver(newSiteSchema),
    defaultValues,
  });

  const onSubmit = (data: z.infer<typeof newSiteSchema>) => {
    console.log(data);
    const newSiteNode: SitePayload = {
      type: NodeType.SITE,
      ...data,
    };
    uploadMutation.mutate(newSiteNode);
  };

  const uploadMutation = useMutation({
    mutationFn: (node: SitePayload) => uploadNode(parentPath, node),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      onClose?.();
    },
    onError: (error: Error) => {
      console.error("Node upload failed:", error);
      alert(`Node upload failed: ${error.message}`);
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Site</DialogTitle>
        <DialogDescription>
          It will be available under {parentPath}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-0"
        >
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem className="px-0 py-0 mb-2">
                <FormLabel className="block">Name</FormLabel>
                <FormDescription>
                  Internal name of the site, used in URLs and file paths.
                </FormDescription>
                <FormControl>
                  <Input {...field} className="h-10" />
                </FormControl>
                <div className="h-6">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem className="px-0 py-0 mb-2">
                <FormLabel className="block">Display Title</FormLabel>
                <FormDescription>
                  Optional display title for the site. If not set, the name is
                  used.
                </FormDescription>
                <FormControl>
                  <Input {...field} className="h-10" />
                </FormControl>
                <div className="h-6">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem className="px-0 py-0 mb-2">
                <FormLabel className="block">Description</FormLabel>
                <FormDescription>
                  Optional description for the site. Will appear in metadata and
                  search results.
                </FormDescription>
                <FormControl>
                  <Input {...field} className="h-10" />
                </FormControl>
                <div className="h-6">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            name="defaultPageTemplatePath"
            control={form.control}
            render={({ field }) => (
              <FormItem className="px-0 py-0 mb-2">
                <FormLabel className="block">
                  Default Page Template Path
                </FormLabel>
                <FormDescription>
                  Path to a page template that will be used by default for all
                  pages in this site.
                </FormDescription>
                <FormControl>
                  <Input {...field} className="h-10" />
                </FormControl>
                <div className="h-6">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button
              type="submit"
              className="mt-4 h-10"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
