import React, { useState, useCallback } from "react";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import EmptyState from "@/components/EmptyState";

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | number;
  parent_category?: {
    id: string | number;
    name: string;
  };
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
  isMobile?: boolean;
}

const CategoryList: React.FC<CategoryListProps> = ({
  data,
  fetchCategories,
  onSortToggle,
  isMobile,
}) => {
  const dispatch = useAppDispatch();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteItemID, setDeleteItemID] = useState<string | null>(null);
  const navigate = useNavigation();

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
          await dispatch(deleteCategory(deleteItemID));
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

  // Helper function to get parent category name
  const getParentCategoryName = useCallback((category: Category): string => {
    if (category.parent_category?.name) {
      return category.parent_category.name;
    }
    return "---";
  }, []);

  // Check if there are any categories to display
  const hasCategoriesData = data.categories && data.categories.length > 0;

  return (
    <div className="pb-4 overflow-auto">
      {hasCategoriesData ? (
        <div className="rounded-md">
          <Table>
            <TableHeader className="w-1/2 text-[13px]">
              <TableRow>
                <TableHead className="w-2/5">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={onSortToggle}
                  >
                    Name
                    <ChevronsUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="w-2/5">Slug</TableHead>
                <TableHead className="w-1/5">Parent Category</TableHead>
                <TableHead className="w-[100px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.categories.map((category) => (
                <TableRow
                  key={category.id}
                  onClick={() => handleRowClick(category.id)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <h3 className="font-normal">
                      {category.name || "Unnamed Category"}
                    </h3>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 font-normal">
                      {category.slug || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 font-normal">
                      {getParentCategoryName(category)}
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
                          onClick={(e) => handleEditClick(e, category.id)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          contentType="categories"
          title="No categories found"
          description="Your categories list is empty"
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
            <DialogTitle className="text-base">Delete Category</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this category?
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

export default CategoryList;
