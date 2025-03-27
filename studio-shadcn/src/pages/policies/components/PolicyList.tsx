import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Eye } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { useAppDispatch } from "@/hooks/reduxHooks";

import { deletePolicy } from "../../../actions/policies";
import useNavigation from "../../../utils/useNavigation";

interface Policy {
  id: string;
  name: string;
  description?: string;
}

interface PolicyListProps {
  actions?: string[];
  data: {
    policies: Policy[];
    loading: boolean;
    total: number;
  };
  filters: {
    page: number;
    limit: number;
  };
  setFilters: (filters: { page: number; limit: number }) => void;
  fetchPolicies: () => void;
}

function PolicyList({
  data,
  filters,
  setFilters,
  fetchPolicies,
}: PolicyListProps) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigation();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (deleteItemId) {
      dispatch(deletePolicy(deleteItemId)).then(() => fetchPolicies());
      setDialogOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/settings/members/policies/${id}/edit`);
  };

  return (
    <div className="w-full">
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] min-w-[200px]">Name</TableHead>
              <TableHead className="w-[400px] min-w-[400px]">
                Description
              </TableHead>
              <TableHead className="text-center w-[200px] min-w-[200px]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.policies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  No policies found
                </TableCell>
              </TableRow>
            ) : (
              data.policies.map((policy) => (
                <TableRow
                  key={policy.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(policy.id)}
                >
                  <TableCell>
                    <Link
                      to={`/settings/members/policies/${policy.id}/edit`}
                      className="font-medium text-base"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {policy.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-base line-clamp-2">
                      {policy.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Link
                        to={`/settings/members/policies/${policy.id}/view`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                        >
                          <Eye className="h-5 w-5 text-gray-500" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDialogOpen(true);
                          setDeleteItemId(policy.id);
                        }}
                      >
                        <Trash2 className="h-5 w-5 text-gray-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </>

      <div className="flex items-center justify-end py-4">
        <Pagination>
          <div className="flex items-center justify-between w-full px-2">
            <div className="text-sm text-muted-foreground">
              {data.total > 0 &&
                `${(filters.page - 1) * filters.limit + 1}-${Math.min(
                  filters.page * filters.limit,
                  data.total
                )} of ${data.total} results`}
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Rows per page:</span>
                <select
                  className="h-8 w-16 rounded-md border border-input bg-background px-2"
                  value={filters.limit}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      limit: Number(e.target.value),
                      page: 1,
                    })
                  }
                >
                  {[10, 15, 20].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      page: Math.max(1, filters.page - 1),
                    })
                  }
                  disabled={filters.page <= 1}
                >
                  <span className="sr-only">Previous page</span>
                  &larr;
                </Button>
                <div className="text-sm">
                  Page {filters.page} of {Math.ceil(data.total / filters.limit)}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      page: Math.min(
                        Math.ceil(data.total / filters.limit),
                        filters.page + 1
                      ),
                    })
                  }
                  disabled={
                    filters.page >= Math.ceil(data.total / filters.limit)
                  }
                >
                  <span className="sr-only">Next page</span>
                  &rarr;
                </Button>
              </div>
            </div>
          </div>
        </Pagination>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <div className="flex space-x-2 w-full justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PolicyList;
