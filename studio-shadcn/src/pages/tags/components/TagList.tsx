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
  isMobile?: boolean;
}

function TagList({ fetchTags, data, onSortToggle }: TagListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteItemID, setDeleteItemID] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigation();

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
    setDeleteDialogOpen(true);
    setDeleteItemID(id);
  }, []);

  const handleDeleteConfirm = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (deleteItemID) {
        try {
          await dispatch(deleteTag(deleteItemID));
          fetchTags();
        } catch (error) {
          console.error("Error deleting tag:", error);
        } finally {
          setDeleteItemID(null);
          setDeleteDialogOpen(false);
        }
      }
    },
    [deleteItemID, dispatch, fetchTags]
  );

  const handleDeleteCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteItemID(null);
    setDeleteDialogOpen(false);
  }, []);

  // Safely access data
  const tags = data?.tags || [];

  return (
    <div className="pb-4 overflow-auto">
      <div className="rounded-md">
        <Table>
          <TableHeader className="w-1/2 text-[13px]">
            <TableRow>
              <TableHead className="w-1/2">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={onSortToggle}
                >
                  Title
                  <ChevronsUpDown className="ml-1 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="w-2/5">Slug</TableHead>
              <TableHead className="w-[150px] text-center">Action</TableHead>
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
                    <h3 className="font-normal">{tag.name || "Unnamed Tag"}</h3>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 font-normal">
                      {tag.slug || "---"}
                    </p>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent
          className="max-w-sm p-4"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Tag</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this tag?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                handleDeleteCancel(e);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                handleDeleteConfirm(e);
              }}
              type="button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TagList;
