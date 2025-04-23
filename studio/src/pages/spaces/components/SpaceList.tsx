import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Trash2, Pencil, Ellipsis } from "lucide-react";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteSpace } from "../../../actions/spaces";
import { spaceSelector } from "../../../selectors/spaces";
import useNavigation from "../../../utils/useNavigation";
import EmptyState from "@/components/EmptyState";
import { AppDispatch, SpaceListProps, SpaceState } from "../types";

const LoadingRow: React.FC = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-6 w-[200px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-[150px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-[180px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-[160px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-[160px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-8 w-8 rounded-full" />
    </TableCell>
  </TableRow>
);

const MobileLoadingRow: React.FC = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-6 w-[200px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-[80px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-8 w-8 rounded-full" />
    </TableCell>
  </TableRow>
);

const SpaceList: React.FC<SpaceListProps> = ({
  searchQuery = "",
  isMobile = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { spaces, loading } = useSelector(spaceSelector) as SpaceState;
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const history = useNavigation();

  const handleDeleteClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDialogOpen(true);
    setDeleteItemId(id);
  }, []);

  const handleEditClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      history(`/admin/spaces/${id}/edit`);
    },
    [history]
  );

  const handleDelete = async () => {
    if (deleteItemId) {
      await dispatch(deleteSpace(deleteItemId));
      setDialogOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleRowClick = useCallback(
    (id: string) => {
      history(`/admin/spaces/${id}/edit`);
    },
    [history]
  );

  // Format the date to show only the date part
  const formatDate = (dateString?: string) => {
    if (!dateString) return "---";
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day} / ${month} /${year}`;
    } catch (error) {
      return "---";
    }
  };

  // Helper function to display "-" for empty values
  const displayValue = (value: string | null | undefined): string => {
    return value ? value.trim() : "---";
  };

  // Filter spaces based on search query
  const filteredSpaces = React.useMemo(() => {
    return spaces.filter(
      (space) =>
        space.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.site_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.site_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (space.created_at &&
          space.created_at.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [spaces, searchQuery]);

  const hasSpacesData = !loading && filteredSpaces.length > 0;

  // Mobile view table
  if (isMobile) {
    return (
      <div className="pb-4 overflow-auto">
        {loading ? (
          <Table>
            <TableHeader className="text-[13px]">
              <TableRow>
                <TableHead className="w-1/2">Title</TableHead>
                <TableHead className="w-1/3">ID</TableHead>
                <TableHead className="w-[50px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <MobileLoadingRow />
              <MobileLoadingRow />
              <MobileLoadingRow />
            </TableBody>
          </Table>
        ) : hasSpacesData ? (
          <Table>
            <TableHeader className="text-[13px]">
              <TableRow>
                <TableHead className="w-1/2">Title</TableHead>
                <TableHead className="w-1/3">ID</TableHead>
                <TableHead className="w-[50px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpaces.map((space) => (
                <TableRow
                  key={space.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(space.id)}
                >
                  <TableCell>
                    <h3 className="font-normal">{displayValue(space.name)}</h3>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 font-normal">
                      {displayValue(space.id).substring(0, 8)}
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
                          onClick={(e) => handleEditClick(e, space.id)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteClick(e, space.id)}
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
        ) : (
          <EmptyState
            contentType="spaces"
            title="No spaces found"
            description="Your spaces list is empty"
            isMobile={isMobile}
          />
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            className="max-w-sm p-4"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-base">Delete Space</DialogTitle>
              <DialogDescription className="text-sm">
                Are you sure you want to delete this space?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 flex justify-end space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDialogOpen(false)}
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

  // Desktop view table
  return (
    <div className="pb-4 overflow-auto">
      {loading ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4 text-[13px]">Title</TableHead>
              <TableHead className="w-1/4 text-[13px]">ID</TableHead>
              <TableHead className="w-1/6 text-[13px]">Site Title</TableHead>
              <TableHead className="w-1/6 text-[13px]">Site Address</TableHead>
              <TableHead className="w-1/7 text-[13px]">Created on</TableHead>
              <TableHead className="w-[100px] text-[13px] text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
          </TableBody>
        </Table>
      ) : hasSpacesData ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%] text-[13px]">Title</TableHead>
              <TableHead className="w-[20%] text-[13px]">ID</TableHead>
              <TableHead className="w-[15%] text-[13px]">Site Title</TableHead>
              <TableHead className="w-[20%] text-[13px]">
                Site Address
              </TableHead>
              <TableHead className="w-[15%] text-[13px]">Created on</TableHead>
              <TableHead className="w-[10%] text-[13px] text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSpaces.map((space) => (
              <TableRow
                key={space.id}
                className="cursor-pointer"
                onClick={() => handleRowClick(space.id)}
              >
                <TableCell>
                  <Link
                    to={`/admin/spaces/${space.id}/edit`}
                    className="text-foreground hover:underline font-normal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {displayValue(space.name)}
                  </Link>
                </TableCell>
                <TableCell>{displayValue(space.id)}</TableCell>
                <TableCell>{displayValue(space.site_title)}</TableCell>
                <TableCell>{displayValue(space.site_address)}</TableCell>
                <TableCell>{formatDate(space.created_at)}</TableCell>
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
                        onClick={(e) => handleEditClick(e, space.id)}
                        className="cursor-pointer"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteClick(e, space.id)}
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
      ) : (
        <EmptyState
          contentType="spaces"
          title="No spaces found"
          description="Your spaces list is empty"
          isMobile={isMobile}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Space</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this space?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDialogOpen(false)}
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
};

export default SpaceList;
