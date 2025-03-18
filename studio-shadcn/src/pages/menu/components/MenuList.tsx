import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
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
import { Pagination } from "@/components/ui/pagination";

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
}

const MenuList: React.FC<MenuListProps> = ({
  actions,
  data,
  filters,
  setFilters,
  fetchMenus,
}) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = useState<string | number | null>(
    null
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigation();

  const handleDelete = () => {
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
  };

  const handleRowClick = (id: string | number) => {
    navigate(`/settings/website/menus/${id}/edit`);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev: any) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev: any) => ({ ...prev, limit: pageSize, page: 1 }));
  };

  const isDeleteAllowed =
    actions.includes("admin") || actions.includes("delete");

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="w-[150px] text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.loading ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-6">
                Loading...
              </TableCell>
            </TableRow>
          ) : data.menus.length === 0 ? (
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
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell>
                  <Link
                    to={`/settings/website/menus/${menu.id}/edit`}
                    className="text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="font-semibold text-gray-900">{menu.name}</h3>
                  </Link>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDialogOpen(true);
                      setDeleteItemId(menu.id);
                    }}
                    disabled={!isDeleteAllowed}
                  >
                    <Trash2 className="h-5 w-5 text-gray-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {data.total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {`${(filters.page - 1) * filters.limit + 1}-${Math.min(
              filters.page * filters.limit,
              data.total
            )} of ${data.total} results`}
          </p>
          <Pagination
            count={data.total}
            page={filters.page}
            pageSize={filters.limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 15, 20]}
          />
        </div>
      )}

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
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setDeleteItemId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
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
