"use client";

import * as React from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLayoutColumns,
  IconSearch,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Application } from "@/features/applications/api/applications.api";

export type ApplicationTableData = {
  id: number;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  status: string;
  appliedDate: string;
};

// Convert Application to ApplicationTableData
function applicationToTableData(application: Application): ApplicationTableData {
  const jobTitle = typeof application.job === "object" && application.job?.title
    ? application.job.title
    : "Unknown Job";
  
  const applicantName = typeof application.users_permissions_user === "object" && application.users_permissions_user?.fullName
    ? application.users_permissions_user.fullName
    : typeof application.users_permissions_user === "object" && application.users_permissions_user?.email
    ? application.users_permissions_user.email
    : "Unknown Applicant";
  
  const applicantEmail = typeof application.users_permissions_user === "object" && application.users_permissions_user?.email
    ? application.users_permissions_user.email
    : "No email";

  return {
    id: application.id,
    jobTitle,
    applicantName,
    applicantEmail,
    status: application.applicationStatus,
    appliedDate: application.createdAt,
  };
}

// Column definitions
const columns: ColumnDef<ApplicationTableData>[] = [
  {
    accessorKey: "jobTitle",
    header: "Job Title",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.jobTitle}</div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "applicantName",
    header: "Applicant",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.applicantName}</div>
        <div className="text-sm text-muted-foreground">{row.original.applicantEmail}</div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const variantMap: Record<string, "default" | "secondary" | "outline"> = {
        Applied: "outline",
        Reviewed: "secondary",
        Interviewing: "default",
        Rejected: "secondary",
        Hired: "default",
      };
      return (
        <Badge
          variant={variantMap[status] || "outline"}
          className={`px-2 py-0.5 ${
            status === "Rejected" ? "bg-red-100 text-red-800 border-red-300" :
            status === "Hired" ? "bg-green-100 text-green-800 border-green-300" :
            status === "Interviewing" ? "bg-blue-100 text-blue-800 border-blue-300" :
            ""
          }`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "appliedDate",
    header: "Applied Date",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {format(new Date(row.original.appliedDate), "MMM d, yyyy")}
      </div>
    ),
  },
  {
    id: "actions",
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Update Status</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Resume</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ApplicationsTable({ 
  applications 
}: { 
  applications: Application[];
}) {
  const data = React.useMemo(() => applications.map(applicationToTableData), [applications]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "appliedDate", desc: true }, // Sort by date descending by default
  ]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: "includesString",
    manualPagination: false,
  });

  return (
    <div className="w-full flex-col justify-start">
      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={sorting[0]?.id || "appliedDate"}
          onValueChange={(value) => {
            setSorting([{ id: value, desc: sorting[0]?.desc || false }]);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jobTitle">Job Title</SelectItem>
            <SelectItem value="applicantName">Applicant</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="appliedDate">Applied Date</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sorting[0]?.desc ? "desc" : "asc"}
          onValueChange={(value) => {
            setSorting([
              { id: sorting[0]?.id || "appliedDate", desc: value === "desc" },
            ]);
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <IconLayoutColumns className="mr-2 h-4 w-4" />
              Columns
              <IconChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table Container */}
      <div className="relative mt-4 flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} applications
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <IconChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

