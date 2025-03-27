import React, { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Trash2, Ellipsis, Pencil, ChevronsUpDown } from "lucide-react";
import { deleteMenu } from "../../../actions/menu";
import useNavigation from "../../../utils/useNavigation";
import { AppDispatch } from "../../../store";

// shadcn components
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

// Define types
interface Menu {
  id: string | number;
  name: string;
  [key: string]: any;
}

interface MenuListProps {
  actions: string[];
  data: {
    menus: Menu[];
    loading: boolean;
    total: number;
  };
  filters: {
    page: number;
    limit: number;
    [key: string]: any;
  };
  setFilters: (filters: any) => void;
  fetchMenus: () => void;
  sortOrder?: "asc" | "desc";
  onSortToggle?: () => void;
}

const MenuList: React.FC<MenuListProps> = ({
  actions,
  data,
  fetchMenus,
  onSortToggle,
}) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = useState<string | number | null>(
    null
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigation();

  // Memoize handlers to prevent unnecessary re-renders
  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, id: string | number) => {
      e.stopPropagation();
      setDialogOpen(true);
      setDeleteItemId(id);
    },
    []
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deleteItemId) {
      dispatch(deleteMenu(deleteItemId))
        .then(() => {
          fetchMenus();
          setDialogOpen(false);
          setDeleteItemId(null);
        })
        .catch((error) => {
          console.error("Error deleting menu:", error);
          setDialogOpen(false);
        });
    }
  }, [deleteItemId, dispatch, fetchMenus]);

  const handleDeleteCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogOpen(false);
    setDeleteItemId(null);
  }, []);

  const handleRowClick = useCallback(
    (id: string | number) => {
      navigate(`/settings/website/menus/${id}/edit`);
    },
    [navigate]
  );

  const isDeleteAllowed =
    actions.includes("admin") || actions.includes("delete");

  return (
    <div className="pb-4 overflow-auto">
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-full">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={onSortToggle}
                >
                  Name
                  <ChevronsUpDown className="ml-1 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="w-[150px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.menus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-6">
                  No menus found
                </TableCell>
              </TableRow>
            ) : (
              data.menus.map((menu) => (
                <TableRow
                  key={menu.id}
                  onClick={() => handleRowClick(menu.id)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <Link
                      to={`/settings/website/menus/${menu.id}/edit`}
                      className="font-normal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {menu.name || "Unnamed Menu"}
                    </Link>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(menu.id);
                          }}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteClick(e, menu.id)}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                          disabled={!isDeleteAllowed}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Menu</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this menu?
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
              disabled={!isDeleteAllowed}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuList;
