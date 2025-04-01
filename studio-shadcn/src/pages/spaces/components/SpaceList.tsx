import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Trash2, Pencil, Ellipsis, ChevronsUpDown } from "lucide-react";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
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
import { Skeleton } from "@/components/ui/skeleton";
import { deleteSpace } from "../../../actions/spaces";
import { spaceSelector } from "../../../selectors/spaces";
import useNavigation from "../../../utils/useNavigation";

// Define types for the space object
interface Space {
  id: string;
  name: string;
  site_address: string;
  site_title: string;
  created_at: string;
}

// Define type for the space selector return
interface SpaceState {
  spaces: Space[];
  loading: boolean;
}

// Define props type for the component
interface SpaceListProps {
  searchQuery?: string;
  sortOrder?: "asc" | "desc";
  onSortToggle?: () => void;
  filters?: {
    page: number;
    limit: number;
  };
  setFilters?: (filters: { page: number; limit: number }) => void;
}

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

const SpaceList: React.FC<SpaceListProps> = ({
  searchQuery = "",
  sortOrder = "asc",
  onSortToggle,
}) => {
  const dispatch: ThunkDispatch<any, unknown, AnyAction> = useDispatch();
  const { spaces, loading } = useSelector(spaceSelector) as SpaceState;
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const history = useNavigation();

  // Name sorting uses the props or parent component control
  const currentNameSortOrder = sortOrder || "asc";

  // Date sorting is managed internally
  const [dateSortOrder, setDateSortOrder] = useState<"asc" | "desc">("desc"); // Default newest first
  const [sortBy, setSortBy] = useState<"name" | "date">("name"); // Default sort by name

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

  // Handle name column sort
  const handleNameSort = () => {
    setSortBy("name");
    if (onSortToggle) {
      onSortToggle();
    }
  };

  // Handle date column sort
  const handleDateSort = () => {
    setSortBy("date");
    setDateSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Format the date to show only the date part
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
    } catch (error) {
      return "-";
    }
  };

  // Helper function to display "-" for empty values
  const displayValue = (value: string | null | undefined): string => {
    return value ? value.trim() : "---";
  };

  // Filter and sort spaces
  const filteredAndSortedSpaces = React.useMemo(() => {
    // First filter the spaces based on search query
    const filtered = spaces.filter(
      (space) =>
        space.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.site_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.site_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (space.created_at &&
          space.created_at.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Then sort the filtered spaces
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        // Sort by name
        const nameA = a.name || "";
        const nameB = b.name || "";
        const comparison = nameA.localeCompare(nameB);
        return currentNameSortOrder === "asc" ? comparison : -comparison;
      } else {
        // Sort by date
        const dateA = new Date(a.created_at || "").getTime();
        const dateB = new Date(b.created_at || "").getTime();
        return dateSortOrder === "asc"
          ? dateA - dateB // Oldest first
          : dateB - dateA; // Newest first
      }
    });
  }, [spaces, searchQuery, sortBy, currentNameSortOrder, dateSortOrder]);

  return (
    <div className="pb-4 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4 text-[13px]">
              <div
                className="flex items-center cursor-pointer"
                onClick={handleNameSort}
              >
                Title
                <ChevronsUpDown className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="w-1/4 text-[13px]">ID</TableHead>
            <TableHead className="w-1/6 text-[13px]">Site Title</TableHead>
            <TableHead className="w-1/6 text-[13px]">Site Address</TableHead>
            <TableHead className="w-1/7 text-[13px]">
              <div
                className="flex items-center cursor-pointer"
                onClick={handleDateSort}
              >
                Created On
                <ChevronsUpDown className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="w-[100px] text-[13px] text-center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <>
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
            </>
          ) : filteredAndSortedSpaces.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">
                No spaces found
              </TableCell>
            </TableRow>
          ) : (
            filteredAndSortedSpaces.map((space) => (
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
            ))
          )}
        </TableBody>
      </Table>

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
