import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Trash2, Pencil, Ellipsis, ChevronsUpDown } from "lucide-react";
import { deleteClaim } from "../../../actions/claims";
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
import EmptyState from "@/components/EmptyState";
import { ClaimListProps } from "../types";

function ClaimList({
  data,
  fetchClaims,
  onSortToggle,
  sortBy = "date",
  onSortByChange,
  isMobile = false,
}: ClaimListProps) {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteItemId) {
      await dispatch(deleteClaim(deleteItemId));
      fetchClaims();
      setModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/claims/${id}/edit`);
  };

  const handleSortByClaimToggle = () => {
    if (onSortByChange) {
      onSortByChange("claim");
    }
    if (sortBy === "claim" && onSortToggle) {
      onSortToggle();
    }
  };

  const handleSortByDateToggle = () => {
    if (onSortByChange) {
      onSortByChange("date");
    }
    if (sortBy === "date" && onSortToggle) {
      onSortToggle();
    }
  };

  // Check if there are any claims to display
  const hasClaimsData = data.claims && data.claims.length > 0;

  return (
    <div className="pb-4 overflow-scroll">
      {hasClaimsData ? (
        <div className="rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%] text-[13px]">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={handleSortByClaimToggle}
                  >
                    Claim
                    <ChevronsUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="w-[20%] text-[13px]">Claimant</TableHead>
                <TableHead className="w-[20%] text-[13px]">Rating</TableHead>
                <TableHead className="w-[20%] text-[13px]">
                  <div
                    className="flex text-[13px] items-center cursor-pointer"
                    onClick={handleSortByDateToggle}
                  >
                    Claim Date
                    <ChevronsUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="w-[10%] text-[13px] text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.claims.map((record) => (
                <TableRow
                  key={record.id.toString()}
                  onClick={() => handleRowClick(record.id.toString())}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <Link
                      to={`/claims/${record.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {record.claim}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/claimants/${record.claimant_id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {record.claimant}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/ratings/${record.rating_id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {record.rating}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span title={record.claim_date}>
                      {record.claim_date
                        ? dayjs(record.claim_date).format("MMMM D, YYYY")
                        : "---"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon">
                          <Ellipsis className="h-5 w-5 text-[#858585]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/claims/${record.id}/edit`);
                          }}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalOpen(true);
                            setDeleteItemId(record.id.toString());
                          }}
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
          contentType="claims"
          title="No claims found"
          description="Your claims list is empty"
          isMobile={isMobile}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Claim</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this claim?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(false);
                setDeleteItemId(null);
              }}
            >
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

export default ClaimList;
