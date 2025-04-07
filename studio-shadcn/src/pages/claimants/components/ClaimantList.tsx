import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Trash2, Pencil, Ellipsis, ChevronsUpDown } from "lucide-react";
import { deleteClaimant } from "../../../actions/claimants";
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
import EmptyState from "@/components/EmptyState";

interface Claimant {
  id: string;
  name: string;
  tag_line: string;
}

interface ClaimantListProps {
  actions?: string[];
  data: {
    claimants: Claimant[];
    loading: boolean;
    total: number;
  };
  filters: {
    page: number;
    limit: number;
    [key: string]: any;
  };
  setFilters: (filters: any) => void;
  fetchClaimants: () => void;
  sortOrder?: "asc" | "desc";
  onSortToggle?: () => void;
  isMobile?: boolean;
}

function ClaimantList({
  data,
  fetchClaimants,
  onSortToggle,
  isMobile,
}: ClaimantListProps) {
  const dispatch = useAppDispatch();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const history = useNavigation();

  // Memoize handlers to prevent unnecessary re-renders
  const handleDeleteClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDialogOpen(true);
    setDeleteItemId(id);
  }, []);

  const handleEditClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      history(`/claimants/${id}/edit`);
    },
    [history]
  );

  const handleDeleteConfirm = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (deleteItemId) {
        // Use a promise chain to ensure proper sequence
        dispatch(deleteClaimant(deleteItemId))
          .then(() => {
            setDialogOpen(false);
            setDeleteItemId(null);
            // Only fetch after the delete is complete
            setTimeout(() => fetchClaimants(), 100);
          })
          .catch(() => {
            setDialogOpen(false);
            setDeleteItemId(null);
          });
      }
    },
    [deleteItemId, dispatch, fetchClaimants]
  );

  const handleDeleteCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogOpen(false);
    setDeleteItemId(null);
  }, []);

  const handleRowClick = useCallback(
    (id: string) => {
      history(`/claimants/${id}/edit`);
    },
    [history]
  );

  // Check if there are any claimants to display
  const hasClaimantsData = data.claimants && data.claimants.length > 0;

  return (
    <div className="pb-4 overflow-auto">
      {hasClaimantsData ? (
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
                <TableHead className="w-2/5">Tag Line</TableHead>
                <TableHead className="w-[150px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.claimants.map((claimant) => (
                <TableRow
                  key={claimant.id}
                  onClick={() => handleRowClick(claimant.id)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <Link
                      to={`/claimants/${claimant.id}/edit`}
                      className="font-normal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {claimant.name || "Unnamed Claimant"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 font-normal">
                      {claimant.tag_line || "---"}
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
                          onClick={(e) => handleEditClick(e, claimant.id)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteClick(e, claimant.id)}
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
          contentType="claimants"
          title="No claimants found"
          description="Your claimants list is empty"
          isMobile={isMobile}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Claimant</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this claimant?
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

export default ClaimantList;
