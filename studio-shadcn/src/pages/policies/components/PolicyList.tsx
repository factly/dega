import React, { useState, useCallback } from "react";
import { Trash2, Pencil, Ellipsis, ChevronsUpDown, Eye } from "lucide-react";
import { deletePolicy } from "../../../actions/policies";
import useNavigation from "../../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
// Shadcn components
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import EmptyState from "@/components/EmptyState";
import { PolicyListProps } from "../types";

const PolicyList: React.FC<PolicyListProps> = ({
  data,
  fetchPolicies,
  onSortToggle,
  isMobile,
}) => {
  const dispatch = useAppDispatch();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteItemID, setDeleteItemID] = useState<string | null>(null);
  const navigate = useNavigation();

  const handleRowClick = useCallback(
    (id: string) => {
      navigate(`/settings/members/policies/${id}/edit`);
    },
    [navigate]
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      navigate(`/settings/members/policies/${id}/edit`);
    },
    [navigate]
  );

  const handleViewClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      navigate(`/settings/members/policies/${id}/view`);
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
          await dispatch(deletePolicy(deleteItemID));
          fetchPolicies();
        } catch (error) {
          console.error("Error deleting policy:", error);
        } finally {
          setDeleteItemID(null);
          setDeleteDialogOpen(false);
        }
      }
    },
    [deleteItemID, dispatch, fetchPolicies]
  );

  const handleDeleteCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteItemID(null);
    setDeleteDialogOpen(false);
  }, []);

  // Check if there are any policies to display
  const hasPoliciesData = data.policies && data.policies.length > 0;

  return (
    <div className="pb-4 overflow-auto">
      {hasPoliciesData ? (
        <div className="rounded-md">
          <Table>
            <TableHeader className="text-[13px]">
              <TableRow>
                <TableHead className="w-[45%]">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={onSortToggle}
                  >
                    Name
                    <ChevronsUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                {!isMobile && (
                  <TableHead className="w-[45%] min-w-[400px]">
                    Description
                  </TableHead>
                )}
                <TableHead className="w-[10%] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.policies.map((policy) => (
                <TableRow
                  key={policy.id}
                  onClick={() => handleRowClick(policy.id)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <h3 className="font-normal">
                      {policy.name || "Unnamed Policy"}
                    </h3>
                    {isMobile && policy.description && (
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                        {policy.description}
                      </p>
                    )}
                  </TableCell>
                  {!isMobile && (
                    <TableCell>
                      <div className="font-normal line-clamp-2">
                        {policy.description}
                      </div>
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
                          onClick={(e) => handleViewClick(e, policy.id)}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => handleEditClick(e, policy.id)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteClick(e, policy.id)}
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
          contentType="policies"
          title="No policies found"
          description="Your policies list is empty"
          isMobile={isMobile}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent
          className="max-w-sm p-4"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Policy</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this policy?
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
};

export default PolicyList;
