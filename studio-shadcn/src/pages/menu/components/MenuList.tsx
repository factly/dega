import React, { useState, useCallback } from "react";
import { Trash2, Pencil, Ellipsis } from "lucide-react";
import { deleteMenu } from "../../../actions/menu";
import useNavigation from "../../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
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
import { MenuListProps } from "../types";

const MenuList: React.FC<MenuListProps> = ({
  actions,
  data,
  fetchMenus,
  isMobile,
}) => {
  const dispatch = useAppDispatch();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteItemID, setDeleteItemID] = useState<string | number | null>(
    null
  );
  const navigate = useNavigation();

  const handleRowClick = useCallback(
    (id: string | number) => {
      navigate(`/settings/website/menus/${id}/edit`);
    },
    [navigate]
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent, id: string | number) => {
      e.stopPropagation();
      navigate(`/settings/website/menus/${id}/edit`);
    },
    [navigate]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, id: string | number) => {
      e.stopPropagation();
      setDeleteDialogOpen(true);
      setDeleteItemID(id);
    },
    []
  );

  const handleDeleteConfirm = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (deleteItemID) {
        try {
          await dispatch(deleteMenu(deleteItemID));
          fetchMenus();
        } catch (error) {
          console.error("Error deleting menu:", error);
        } finally {
          setDeleteItemID(null);
          setDeleteDialogOpen(false);
        }
      }
    },
    [deleteItemID, dispatch, fetchMenus]
  );

  const handleDeleteCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteItemID(null);
    setDeleteDialogOpen(false);
  }, []);

  const isDeleteAllowed =
    actions.includes("admin") || actions.includes("delete");

  // Check if there are any menus to display
  const hasMenusData = data.menus && data.menus.length > 0;

  return (
    <div className="pb-4 overflow-auto">
      {hasMenusData ? (
        <div className="rounded-md">
          <Table>
            <TableHeader className="text-[13px]">
              <TableRow>
                <TableHead className="w-full">Name</TableHead>
                <TableHead className="w-[150px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.menus.map((menu) => (
                <TableRow
                  key={menu.id}
                  onClick={() => handleRowClick(menu.id)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <h3 className="font-normal">
                      {menu.name || "Unnamed Menu"}
                    </h3>
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
                          onClick={(e) => handleEditClick(e, menu.id)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          contentType="menus"
          title="No menus found"
          description="Your menus list is empty"
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
            <DialogTitle className="text-base">Delete Menu</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this menu?
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
