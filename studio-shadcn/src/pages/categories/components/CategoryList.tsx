// components/CategoryList.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Pencil, Ellipsis } from "lucide-react";
import { deleteCategory } from "../../../actions/categories";
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
import { CategoryListProps } from "../types";

function CategoryList({
  data,
  fetchCategories,
  isMobile = false,
}: CategoryListProps) {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteItemId) {
      await dispatch(deleteCategory(deleteItemId));
      fetchCategories();
      setModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/categories/${id}/edit`);
  };

  // Get parent category name helper
  const getParentCategoryName = (category: any): string => {
    if (category.parent_category?.name) {
      return category.parent_category.name;
    }
    return "---";
  };

  // Check if there are any categories to display
  const hasCategoriesData = data.categories && data.categories.length > 0;

  return (
    <div className="pb-4 overflow-scroll">
      {hasCategoriesData ? (
        <div className="rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%] text-[13px]">Name</TableHead>
                <TableHead className="w-[25%] text-[13px]">Slug</TableHead>
                <TableHead className="w-[25%] text-[13px]">
                  Parent Category
                </TableHead>
                <TableHead className="w-[10%] text-[13px] text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.categories.map((category) => (
                <TableRow
                  key={category.id}
                  onClick={() => handleRowClick(category.id.toString())}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <Link
                      to={`/categories/${category.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {category.name || "Unnamed Category"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="line-clamp-2">{category.slug || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="line-clamp-2">
                      {getParentCategoryName(category)}
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
                            navigate(`/categories/${category.id}/edit`);
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
                            setDeleteItemId(category.id.toString());
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
          contentType="categories"
          title="No categories found"
          description="Your categories list is empty"
          isMobile={isMobile}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm p-4">
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

export default CategoryList;
