import React, { useState, useCallback } from "react";
import { Trash2, Pencil, Ellipsis, ChevronsUpDown } from "lucide-react";
import { deleteTag } from "../../../actions/tags";
import useNavigation from "../../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagListProps {
  filters: {
    page?: number;
    limit?: number;
    [key: string]: any;
  };
  setFilters: (filters: any) => void;
  fetchTags: () => void;
  data: {
    tags: Tag[] | null;
    loading: boolean;
    total: number;
  };
  sortOrder?: "asc" | "desc";
  onSortToggle?: () => void;
}

function TagList({
  filters,
  setFilters,
  fetchTags,
  data,
  onSortToggle,
}: TagListProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteItemID, setDeleteItemID] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigation();

  // Safely access filters with defaults
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;

  const handleRowClick = useCallback(
    (id: string) => {
      navigate(`/tags/${id}/edit`);
    },
    [navigate]
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      navigate(`/tags/${id}/edit`);
    },
    [navigate]
  );

  const handleDeleteClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setModalOpen(true);
    setDeleteItemID(id);
  }, []);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (deleteItemID) {
        dispatch(deleteTag(deleteItemID)).then(() => {
          fetchTags();
          setModalOpen(false);
          setDeleteItemID(null);
        });
      }
    },
    [deleteItemID, dispatch, fetchTags]
  );

  const handleCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpen(false);
    setDeleteItemID(null);
  }, []);

  // Safely calculate total pages
  const tags = data?.tags || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="flex flex-col h-full">
      {/* Table container with flex-grow to push pagination to bottom */}
      <div className="flex-grow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px] min-w-[200px]">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={onSortToggle}
                >
                  Title
                  <ChevronsUpDown className="ml-1 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="w-[400px] min-w-[200px]">Slug</TableHead>
              <TableHead className="text-center w-[150px] min-w-[150px]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.length > 0 ? (
              tags.map((tag) => (
                <TableRow
                  key={tag.id}
                  onClick={() => handleRowClick(tag.id)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <h3>{tag.name}</h3>
                  </TableCell>
                  <TableCell>
                    <h3>{tag.slug}</h3>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon">
                          <Ellipsis className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => handleEditClick(e, tag.id)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteClick(e, tag.id)}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No tags found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer - fixed at bottom */}
      <div className="flex items-center justify-between py-2 border-t mt-auto">
        {/* Results count - left aligned */}
        <div>
          <p className="text-sm text-muted-foreground">
            {page > 0 && total > 0
              ? `${(page - 1) * limit + 1}-${Math.min(
                  page * limit,
                  total
                )} out of ${total} results`
              : `0-0 out of ${total} results`}
          </p>
        </div>

        {/* Pagination controls and rows per page - right aligned */}
        <div className="flex items-center space-x-4">
          {/* Rows per page */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <select
              className="h-8 rounded-md border border-input px-2"
              value={limit}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  limit: Number(e.target.value),
                  page: 1,
                })
              }
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>

          {/* Page indicator */}
          <div className="flex items-center space-x-1">
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                page > 1 && setFilters({ ...filters, page: page - 1 })
              }
              disabled={page <= 1}
            >
              <PaginationPrevious className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                page < totalPages && setFilters({ ...filters, page: page + 1 })
              }
              disabled={page >= totalPages}
            >
              <PaginationNext className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Tag</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this tag?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TagList;
