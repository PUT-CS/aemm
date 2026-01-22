import { useState } from "react";
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
import { Button } from "~/components/ui/button";
import { FaPen, FaXmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Row } from "@tanstack/react-table";
import type { User } from "@aemm/common";
import { deleteUser, editUser } from "~/routes/admin/UsersTab/mutations";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface DropdownActionsProps {
  row: Row<User>;
}

export function DropdownActions({ row }: DropdownActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<User["role"]>(row.original.role);

  const queryClient = useQueryClient();

  const username = row.original.username;

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      console.error("User deletion failed:", error);
      alert(`User deletion failed: ${error.message}`);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({
      username,
      password,
      role,
    }: {
      username: string;
      password?: string;
      role?: User["role"];
    }) => editUser(username, { password, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditDialogOpen(false);
      setPassword("");
    },
    onError: (error: Error) => {
      console.error("User update failed:", error);
      alert(`User update failed: ${error.message}`);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(username);
  };

  const handleEditSave = () => {
    editMutation.mutate({
      username,
      password: password || undefined,
      role,
    });
  };

  return (
    <>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <FaPen className="size-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <FaTrash className="size-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>

      {/* Delete dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete user <strong>{username}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <FaXmark className="size-4" />
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 gap-2"
            >
              <FaTrash className="size-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {username}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={role}
                onValueChange={(val) => setRole(val as User["role"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2"
                disabled={editMutation.isPending}
              >
                <FaXmark />
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="h-10 gap-2"
              onClick={handleEditSave}
              disabled={editMutation.isPending}
            >
              {editMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
