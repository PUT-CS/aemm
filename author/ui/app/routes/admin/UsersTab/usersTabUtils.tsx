import type {ColumnDef} from "@tanstack/react-table";
import {DropdownActions} from "~/routes/admin/UsersTab/DropdownActions";
import type {User} from "common/aemm";

export async function fetchUsers(): Promise<User[]> {
  // Placeholder function to fetch users
  return [
    {
      id: "1",
      username: "mmilek",
      passwordHash: "hashed_password",
      role: "admin",
      createdAt: new Date("2024-01-15T10:30:00Z"),
      updatedAt: new Date("2024-11-01T14:20:00Z"),
    },
    {
      id: "2",
      username: "snowak",
      passwordHash: "hashed_password",
      role: "editor",
      createdAt: new Date("2024-03-20T09:15:00Z"),
      updatedAt: new Date("2024-10-15T16:45:00Z"),
    },
    {
      id: "3",
      username: "leszmak",
      passwordHash: "hashed_password",
      role: "editor",
      createdAt: new Date("2024-06-10T11:00:00Z"),
      updatedAt: new Date("2024-11-05T08:30:00Z"),
    },
  ];
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <span className="capitalize">{role}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date;
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => {
      return <DropdownActions />;
    },
  },
];
