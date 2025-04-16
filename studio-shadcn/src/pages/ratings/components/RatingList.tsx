import React, { useState, useCallback } from "react";
import { Trash2, Pencil, Ellipsis } from "lucide-react";
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
import { useAppDispatch } from "@/hooks/reduxHooks";
import EmptyState from "@/components/EmptyState";
import { Rating, RatingListProps } from "../types";

const RatingList: React.FC<RatingListProps> = ({
  data,
  fetchRatings,
  isMobile = false,
}) => {
  const navigate = useNavigation();
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [ratingToDelete, setRatingToDelete] = useState<Rating | null>(null);

  // Memoize handlers to prevent unnecessary re-renders
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
          // Only fetch after the delete is complete
          setTimeout(() => fetchRatings(), 100);
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

  // Check if there are any ratings to display
  const hasRatingsData = data.ratings && data.ratings.length > 0;

  return (
    <div className="pb-4 overflow-auto">
      {hasRatingsData ? (
        <div className="rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%] text-[13px]">Title</TableHead>
                <TableHead className="w-[25%] text-[13px]">Preview</TableHead>
                <TableHead className="w-[25%] text-[13px]">Value</TableHead>
                <TableHead className="w-[10%] text-center text-[13px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.ratings.map((rating) => (
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
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          contentType="ratings"
          title="No ratings found"
          description="Your ratings list is empty"
          isMobile={isMobile}
        />
      )}

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
