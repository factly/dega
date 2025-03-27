import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
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
} from "@/components/ui/dropdown-menu";
import { useAppDispatch } from "@/hooks/reduxHooks";

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
  sortOrder?: "asc" | "desc";
  onSortToggle?: () => void;
}

function FormatList({ data, fetchFormats, onSortToggle }: FormatListProps) {
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

  return (
    <div className="pb-4 overflow-auto">
      <div className="rounded-md">
        <Table>
          <TableHeader className="w-1/2 text-[13px]">
            <TableRow>
              <TableHead className="w-[200px]">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={onSortToggle}
                >
                  Name
                  {onSortToggle && (
                    <div className="flex items-center">
                      <ChevronsUpDown className="ml-1 h-3 w-3" />
                      <span className="ml-1 text-xs text-muted-foreground"></span>
                    </div>
                  )}
                </div>
              </TableHead>
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
            ) : data.formats && data.formats.length > 0 ? (
              data.formats.map((format) => (
                <TableRow
                  key={format.id}
                  onClick={() => handleRowClick(format.id)}
                  className="cursor-pointer"
                >
                  <TableCell className="min-w-[200px]">
                    <Link
                      to={`/settings/advanced/formats/${format.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {format.name || "Unnamed Format"}
                    </Link>
                  </TableCell>
                  <TableCell className="min-w-[400px]">
                    <p>{format.description || "---"}</p>
                  </TableCell>
                  <TableCell className="min-w-[150px] text-center">
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No formats found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm p-4">
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
