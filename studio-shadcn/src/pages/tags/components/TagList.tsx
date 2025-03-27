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

  // Safely access data
  const tags = data?.tags || [];

  return (
    <div className="flex flex-col h-full">
      {/* Table */}
      <div className="rounded-md">
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
