import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Trash2 } from "lucide-react";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Define the types for the props and data
interface Claim {
  id: string;
  claim: string;
  claimant: string;
  claimant_id: string;
  rating: string;
  rating_id: string;
  claim_date: string;
}

interface ClaimListProps {
  data: {
    claims: Claim[];
    loading: boolean;
    total: number;
  };
  filters: {
    page: number;
    limit: number;
  };
  fetchClaims: () => void;
  onPagination: (pageNumber: number, pageSize: number) => void;
}

function ClaimList({
  data,
  filters,
  fetchClaims,
  onPagination,
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

  // Calculate pagination details
  const startItem = (filters.page - 1) * filters.limit + 1;
  const endItem = Math.min(startItem + filters.limit - 1, data.total);

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Claim</TableHead>
              <TableHead className="min-w-[200px]">Claimant</TableHead>
              <TableHead className="min-w-[200px]">Rating</TableHead>
              <TableHead className="min-w-[200px]">Claim Date</TableHead>
              <TableHead className="min-w-[150px] text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.claims.map((record) => (
              <TableRow
                key={record.id}
                onClick={() => handleRowClick(record.id)}
                className="cursor-pointer"
              >
                <TableCell>
                  <Link
                    to={`/claims/${record.id}/edit`}
                    className="font-medium text-gray-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {record.claim}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/claimants/${record.claimant_id}/edit`}
                    className="font-medium text-gray-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {record.claimant}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/ratings/${record.rating_id}/edit`}
                    className="font-medium text-gray-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {record.rating}
                  </Link>
                </TableCell>
                <TableCell>
                  <span
                    className="font-medium text-gray-900"
                    title={record.claim_date}
                  >
                    {record.claim_date
                      ? dayjs(record.claim_date).format("MMMM D, YYYY")
                      : null}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalOpen(true);
                      setDeleteItemId(record.id);
                    }}
                  >
                    <Trash2 className="h-5 w-5 text-gray-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {`${startItem}-${endItem} of ${data.total} results`}
        </p>

        <div className="flex items-center space-x-2">
          <select
            className="h-9 rounded-md border border-input bg-background px-3"
            value={filters.limit}
            onChange={(e) => onPagination(1, Number(e.target.value))}
          >
            {[10, 15, 20].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

          <Pagination>
            <PaginationContent>
              <PaginationPrevious
                onClick={() =>
                  filters.page > 1 &&
                  onPagination(filters.page - 1, filters.limit)
                }
                className={
                  filters.page <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />

              {/* Show current page and total pages */}
              <PaginationItem>
                <span className="h-9 w-9 flex items-center justify-center">
                  {filters.page} / {Math.ceil(data.total / filters.limit)}
                </span>
              </PaginationItem>

              <PaginationNext
                onClick={() =>
                  filters.page < Math.ceil(data.total / filters.limit) &&
                  onPagination(filters.page + 1, filters.limit)
                }
                className={
                  filters.page >= Math.ceil(data.total / filters.limit)
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[311px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this claim?
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(false);
                setDeleteItemId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClaimList;
