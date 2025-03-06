import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { deleteFormat } from "../../../actions/formats";
import useNavigation from "../../../utils/useNavigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define interfaces for type safety
interface Format {
  id: string;
  name: string;
  description: string;
}

interface FormatData {
  formats: Format[];
  loading: boolean;
  total: number;
}

interface Filters {
  page: number;
  limit: number;
}

interface FormatListProps {
  data: FormatData;
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  fetchFormats: () => void;
}

function FormatList({
  data,
  filters,
  setFilters,
  fetchFormats,
}: FormatListProps) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigation();

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteItemId) {
      dispatch(deleteFormat(deleteItemId) as any).then(() => fetchFormats());
      setDialogOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/settings/advanced/formats/${id}/edit`);
  };

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[400px]">Description</TableHead>
              <TableHead className="w-[150px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              data.formats.map((format) => (
                <TableRow
                  key={format.id}
                  onClick={() => handleRowClick(format.id)}
                  className="cursor-pointer hover:bg-muted"
                >
                  <TableCell className="min-w-[200px]">
                    <Link
                      to={`/settings/advanced/formats/${format.id}/edit`}
                      className="font-medium text-base"
                    >
                      {format.name}
                    </Link>
                  </TableCell>
                  <TableCell className="min-w-[400px]">
                    <p className="line-clamp-2 text-base font-medium">
                      {format.description}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-[150px] text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDialogOpen(true);
                        setDeleteItemId(format.id);
                      }}
                    >
                      <Trash2 className="h-5 w-5 text-gray-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          {data.formats.length > 0 ? (filters.page - 1) * filters.limit + 1 : 0}
          -{Math.min(filters.page * filters.limit, data.total)} of {data.total}{" "}
          results
        </p>
        <div className="flex items-center space-x-6">
          <Select
            value={String(filters.limit)}
            onValueChange={(value) =>
              setFilters({ page: 1, limit: Number(value) })
            }
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    filters.page > 1 && setFilters({ page: filters.page - 1 })
                  }
                  className={
                    filters.page <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4">Page {filters.page}</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    filters.page < Math.ceil(data.total / filters.limit) &&
                    setFilters({ page: filters.page + 1 })
                  }
                  className={
                    filters.page >= Math.ceil(data.total / filters.limit)
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[311px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this?
          </DialogDescription>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setDialogOpen(false);
                setDeleteItemId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FormatList;
