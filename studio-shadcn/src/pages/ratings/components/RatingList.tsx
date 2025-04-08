import React, { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
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
  DropdownMenuSeparator,
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
  sortOrder?: "asc" | "desc";
  onSortToggle?: () => void;
  isMobile?: boolean;
}

const RatingList: React.FC<RatingListProps> = ({
  data,
  fetchRatings,
  onSortToggle,
  isMobile = false,
}) => {
  const navigate = useNavigation();
  const dispatch = useDispatch<AppThunkDispatch>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [ratingToDelete, setRatingToDelete] = useState<Rating | null>(null);

  const handleRowClick = useCallback(
    (id: string) => {
      navigate(`/ratings/${id}/edit`);
    },
    [navigate]
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      navigate(`/ratings/${id}/edit`);
    },
    [navigate]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, rating: Rating) => {
      e.stopPropagation();
      setModalOpen(true);
      setRatingToDelete(rating);
    },
    []
  );

  const handleDeleteConfirm = useCallback(
    async (e: React.MouseEvent) => {
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
    },
    [ratingToDelete, dispatch, fetchRatings]
  );

  const handleDeleteCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpen(false);
    setRatingToDelete(null);
  }, []);

  return (
    <div className="pb-4 overflow-auto">
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className={`min-w-[200px] text-[13px] ${
                  isMobile ? "w-2/5" : ""
                }`}
              >
                <div
                  className="flex items-center cursor-pointer"
                  onClick={onSortToggle}
                >
                  Title
                  <ChevronsUpDown className="ml-1 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead
                className={`${
                  isMobile ? "w-2/5" : "min-w-[250px]"
                } text-[13px]`}
              >
                Preview
              </TableHead>
              <TableHead
                className={`min-w-[100px] text-[13px] ${
                  isMobile ? "w-1/5" : ""
                }`}
              >
                Value
              </TableHead>
              <TableHead
                className={`text-center text-[13px] ${
                  isMobile ? "w-[80px]" : "min-w-[100px]"
                }`}
              >
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.ratings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  No ratings found
                </TableCell>
              </TableRow>
            ) : (
              data.ratings.map((rating) => (
                <TableRow
                  key={rating.id}
                  onClick={() => handleRowClick(rating.id)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <h3 className="text-[#101828]">{rating.name}</h3>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`text-center text-sm rounded-xl ${
                        isMobile ? "w-auto text-xs" : "w-28"
                      }`}
                      style={{
                        color: rating.text_colour?.hex,
                        backgroundColor: rating.background_colour?.hex,
                        padding: isMobile ? "0.15rem" : "0.25rem",
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
                        <DropdownMenuSeparator />
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="max-w-sm p-4"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
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
