import type { DialogProps } from "~/routes/sites/dialogs/dialog.types";
import { Button } from "~/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadNode } from "./mutations";
import { NodeType, type ScrNodeWithoutTimestamps } from "@aemm/common";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

export default function NewFolderDialog({ parentPath, onClose }: DialogProps) {
  const queryClient = useQueryClient();

  const newFolderSchema = z.object({
    name: z.string().min(1, "Folder name is required"),
    title: z.string().optional(),
  });
  const defaultValues = {
    name: "",
    title: "",
  };

  const form = useForm<z.infer<typeof newFolderSchema>>({
    resolver: zodResolver(newFolderSchema),
    defaultValues,
  });

  const onSubmit = (data: z.infer<typeof newFolderSchema>) => {
    console.log(data);
    const newFolderNode: ScrNodeWithoutTimestamps = {
      type: NodeType.FOLDER,
      name: data.name,
      title: data.title,
    };
    uploadMutation.mutate(newFolderNode);
  };

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

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Folder</DialogTitle>
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
                  Internal name of the folder, used in URLs and file paths.
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
                  Optional display title for the folder. If not set, the name is
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
