import React, { useState, useCallback } from "react";
import { Trash2, Pencil, Ellipsis, ChevronsUpDown } from "lucide-react";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch } from "@/hooks/reduxHooks";
import EmptyState from "@/components/EmptyState";
import { FormatListProps } from "../types";
import Loader from "@/components/Loader";

function FormatList({
  data,
  fetchFormats,
  onSortToggle,
  isMobile,
}: FormatListProps) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigation();

  // Memoize handlers to prevent unnecessary re-renders
  const handleDeleteClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDialogOpen(true);
    setDeleteItemId(id);
  }, []);

  const handleEditClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      navigate(`/settings/advanced/formats/${id}/edit`);
    },
    [navigate]
  );

  const handleDeleteConfirm = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (deleteItemId) {
        // Use a promise chain to ensure proper sequence
        dispatch(deleteFormat(deleteItemId) as any)
          .then(() => {
            setDialogOpen(false);
            setDeleteItemId(null);
            // Only fetch after the delete is complete
            setTimeout(() => fetchFormats(), 100);
          })
          .catch(() => {
            setDialogOpen(false);
            setDeleteItemId(null);
          });
      }
    },
    [deleteItemId, dispatch, fetchFormats]
  );

  const handleDeleteCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogOpen(false);
    setDeleteItemId(null);
  }, []);

  const handleRowClick = useCallback(
    (id: string) => {
      navigate(`/settings/advanced/formats/${id}/edit`);
    },
    [navigate]
  );

  // Check if there are any formats to display
  const hasFormatsData = data.formats && data.formats.length > 0;

  return (
    <div className="pb-4 overflow-auto">
      {data.loading ? (
        <Loader />
      ) : hasFormatsData ? (
        <div className="rounded-md">
          <Table>
            <TableHeader className="w-[45%] text-[13px]">
              <TableRow>
                <TableHead className={isMobile ? "w-full" : "w-[200px]"}>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={onSortToggle}
                  >
                    Name
                    <ChevronsUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                {!isMobile && (
                  <TableHead className="w-[45%]">Description</TableHead>
                )}
                <TableHead className="w-[10%] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.formats.map((format) => (
                <TableRow
                  key={format.id}
                  onClick={() => handleRowClick(format.id)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <h3 className="font-normal">
                      {format.name || "Unnamed Format"}
                    </h3>
                    {isMobile && format.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {format.description}
                      </p>
                    )}
                  </TableCell>
                  {!isMobile && (
                    <TableCell className="min-w-[400px]">
                      <p>{format.description || "---"}</p>
                    </TableCell>
                  )}
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
                          onClick={(e) => handleEditClick(e, format.id)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteClick(e, format.id)}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          contentType="formats"
          title="No formats found"
          description="Your formats list is empty"
          isMobile={isMobile}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-sm p-4"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Format</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this format?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button size="sm" variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteConfirm}
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

export default FormatList;
