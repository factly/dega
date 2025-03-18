import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Trash2, Pencil, Ellipsis, ChevronsUpDown } from "lucide-react";
import { deleteRating } from "../../../actions/ratings";
import useNavigation from "../../../utils/useNavigation";
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
import { AppThunkDispatch } from "../../../store/types";

// Type definitions
interface Rating {
  id: string;
  name: string;
  numeric_value: number;
  background_colour?: {
    hex: string;
  };
  text_colour?: {
    hex: string;
  };
}

interface RatingListProps {
  actions: string[];
  data: {
    ratings: Rating[];
    loading: boolean;
    total: number;
  };
  filters: {
    page: number;
    limit: number;
  };
  setFilters: (filters: { page: number; limit: number }) => void;
  fetchRatings: () => void;
}

const RatingList: React.FC<RatingListProps> = ({ data, fetchRatings }) => {
  const history = useNavigation();
  const dispatch = useDispatch<AppThunkDispatch>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [ratingToDelete, setRatingToDelete] = useState<Rating | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortedRatings, setSortedRatings] = useState<Rating[]>([]);

  // Update sortedRatings whenever data.ratings changes
  useEffect(() => {
    const sorted = [...data.ratings].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    setSortedRatings(sorted);
  }, [data.ratings, sortOrder]);

  const handleRowClick = (id: string) => {
    history(`/ratings/${id}/edit`);
  };

  const handleEditClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    history(`/ratings/${id}/edit`);
  };

  const handleDeleteClick = (e: React.MouseEvent, rating: Rating) => {
    e.stopPropagation();
    setModalOpen(true);
    setRatingToDelete(rating);
  };

  const handleDeleteConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (ratingToDelete && ratingToDelete.id) {
      try {
        await dispatch(deleteRating(ratingToDelete.id));
        fetchRatings();
      } catch (error) {
        console.error("Error deleting rating:", error);
      } finally {
        setModalOpen(false);
        setRatingToDelete(null);
      }
    }
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpen(false);
    setRatingToDelete(null);
  };

  const handleSortByTitle = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);

    const sorted = [...data.ratings].sort((a, b) => {
      if (newSortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    setSortedRatings(sorted);
  };

  return (
    <div>
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[400px]">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={handleSortByTitle}
                >
                  Title
                  <ChevronsUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="min-w-[200px]">Preview</TableHead>
              <TableHead className="min-w-[100px]">Rating Value</TableHead>
              <TableHead className="min-w-[100px] text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRatings.map((rating) => (
              <TableRow
                key={rating.id}
                onClick={() => handleRowClick(rating.id)}
                className="cursor-pointer"
              >
                <TableCell>
                  <Link
                    to={`/ratings/${rating.id}/edit`}
                    className="mr-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-[#101828]">{rating.name}</h3>
                  </Link>
                </TableCell>
                <TableCell>
                  <div
                    className="text-center w-28 text-sm rounded-xl"
                    style={{
                      color: rating.text_colour?.hex,
                      backgroundColor: rating.background_colour?.hex,
                      padding: "0.25rem",
                    }}
                  >
                    {rating.name}
                  </div>
                </TableCell>
                <TableCell>
                  <h3 className="text-[#101828]">{rating.numeric_value}</h3>
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
                        onClick={(e) => handleEditClick(e, rating.id)}
                        className="cursor-pointer"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteClick(e, rating)}
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
        <div className="border-t"></div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Rating</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this rating?
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

export default RatingList;
