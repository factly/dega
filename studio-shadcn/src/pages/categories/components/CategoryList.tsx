import React, { useState, useCallback, useMemo } from "react";
import { Trash2, Pencil, Ellipsis, ChevronsUpDown } from "lucide-react";
import { deleteCategory } from "../../../actions/categories";
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
} from "@/components/ui/dropdown-menu";
import { PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryListProps {
  data: {
    categories: Category[];
    loading: boolean;
    total: number;
  };
  filters: {
    page?: number;
    limit?: number;
    [key: string]: any;
  };
  setFilters: (filters: any) => void;
  fetchCategories: () => void;
  sortOrder?: "asc" | "desc";
  onSortToggle?: () => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  data,
  filters,
  setFilters,
  fetchCategories,
  sortOrder = "desc",
  onSortToggle,
}) => {
  const dispatch = useAppDispatch();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteItemID, setDeleteItemID] = useState<string | null>(null);
  const navigate = useNavigation();

  // Safely access filters with defaults
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;

  // Sort categories by name based on sort order
  const sortedCategories = useMemo(() => {
    if (!data.categories || data.categories.length === 0) {
      return [];
    }

    return [...data.categories].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name?.localeCompare(b.name || "") || 0;
      } else {
        return b.name?.localeCompare(a.name || "") || 0;
      }
    });
  }, [data.categories, sortOrder]);

  const handleRowClick = useCallback(
    (id: string) => {
      navigate(`/categories/${id}/edit`);
    },
    [navigate]
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      navigate(`/categories/${id}/edit`);
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
          // Convert string ID to number for the API call
          await dispatch(deleteCategory(parseInt(deleteItemID, 10)));
          fetchCategories();
        } catch (error) {
          console.error("Error deleting category:", error);
        } finally {
          setDeleteItemID(null);
          setDeleteDialogOpen(false);
        }
      }
    },
    [deleteItemID, dispatch, fetchCategories]
  );

  const handleDeleteCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteItemID(null);
    setDeleteDialogOpen(false);
  }, []);

  // Calculate pagination values
  const totalPages = Math.ceil(data.total / limit) || 1;
  const startRange = data.total === 0 ? 0 : (page - 1) * limit + 1;
  const endRange = Math.min(page * limit, data.total);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Table container with flex-grow to push pagination to bottom */}
      <div className="relative w-full overflow-auto flex-grow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={onSortToggle}
                >
                  Name
                  <ChevronsUpDown className="ml-1 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="min-w-[200px]">Slug</TableHead>
              <TableHead className="w-[150px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sortedCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              sortedCategories.map((category) => (
                <TableRow
                  key={category.id}
                  onClick={() => handleRowClick(category.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <h3 className="font-medium text-base">{category.name}</h3>
                  </TableCell>
                  <TableCell>
                    <span className="text-base">{category.slug}</span>
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
                          onClick={(e) => handleEditClick(e, category.id)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteClick(e, category.id)}
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
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between py-2 border-t mt-auto">
        {/* Results count */}
        <div>
          <p className="text-sm text-muted-foreground">
            {data.total > 0
              ? `${startRange}-${endRange} of ${data.total} results`
              : "No results"}
          </p>
        </div>

        {/* Pagination controls */}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Category</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this category?
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
};

export default CategoryList;
