import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNode } from "~/routes/sites/dialogs/mutations";

interface DeleteNodeDialogProps {
  open: boolean;
  nodePath: string;
  onCancel: () => void;
}

export default function DeleteNodeDialog({
  open,
  nodePath,
  onCancel,
}: DeleteNodeDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteNode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree"] });
      onCancel?.();
    },
    onError: (error: Error) => {
      console.error("Node deletion failed:", error);
      alert(`Node deletion failed: ${error.message}`);
    },
  });

  const onConfirm = () => {
    deleteMutation.mutate(nodePath);
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Do you want to delete the node at <strong>{nodePath}</strong> and
            all its children? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
