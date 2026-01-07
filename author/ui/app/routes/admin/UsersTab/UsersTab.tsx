import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import { DataTable } from "~/routes/admin/DataTable";
import { FaCheck, FaPlus, FaXmark } from "react-icons/fa6";
import { columns } from "~/routes/admin/UsersTab/usersTabUtils";
import { fetchUsers } from "~/routes/admin/UsersTab/fetchUsers"
import {createUser} from "~/routes/admin/UsersTab/mutations";

const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
  role: z.string(),
});

export type FormSchema = z.infer<typeof formSchema>;

function AddUserDialog() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "editor",
    },
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // onCLose()?.();
    },
    onError: (error: Error) => {
      console.error("Failed to add a user:", error);
      alert(`Failed to add a user: ${error.message}`);
    },
  });

  const onSubmit = (data: FormSchema) => {
    console.log(data);
  };

  const formItemClasses = "px-0 py-0 mb-2";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItem className={formItemClasses}>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input type="text" {...field} className="h-10" />
              </FormControl>
              <div className="h-6">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem className={formItemClasses}>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="text" {...field} className="h-10" />
              </FormControl>
              <div className="h-6">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          name="role"
          control={form.control}
          render={({ field }) => (
            <FormItem className={formItemClasses}>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <div className="h-6">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="h-10 gap-2">
              <FaXmark />
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" className="h-10 gap-2">
            <FaCheck />
            Confirm
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function UsersTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  console.log(data);
  return (
    <div className="flex flex-col gap-4">
      <Dialog>
        <div className="flex justify-end">
          <DialogTrigger asChild>
            <Button className="gap-2">
              <FaPlus />
              Create User
            </Button>
          </DialogTrigger>
        </div>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <AddUserDialog />
        </DialogContent>
      </Dialog>

      {isLoading && <div>Loading users...</div>}
      {isError && <div>Error loading users.</div>}
      {data && <DataTable columns={columns} data={data} />}
    </div>
  );
}
