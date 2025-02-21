import React from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import useNavigation from '../../../utils/useNavigation';
import { deleteRating } from '../../../actions/ratings';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Rating {
  id: string;
  name: string;
  numeric_value: number;
  text_colour?: {
    hex: string;
  };
  background_colour?: {
    hex: string;
  };
}

interface RatingListProps {
  actions: string[];
  data: {
    ratings: Rating[];
    total: number;
    loading: boolean;
  };
  filters: {
    page: number;
    limit: number;
  };
  setFilters: (filters: { page: number; limit: number }) => void;
  fetchRatings: () => void;
}

function RatingList({ actions, data, filters, setFilters, fetchRatings }: RatingListProps) {
  const history = useNavigation();
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteItemId, setDeleteItemId] = React.useState<string | null>(null);

  const handleRowClick = (rating: Rating) => {
    history(`/ratings/${rating.id}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteItemId) {
      await dispatch(deleteRating(deleteItemId));
      await fetchRatings();
      setModalOpen(false);
      setDeleteItemId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[200px]">Rating Value</TableHead>
              <TableHead className="w-[200px]">Preview</TableHead>
              <TableHead className="w-[150px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.ratings.map((rating) => (
              <TableRow
                key={rating.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleRowClick(rating)}
              >
                <TableCell>
                  <Link
                    to={`/ratings/${rating.id}/edit`}
                    className="text-gray-900 font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {rating.name}
                  </Link>
                </TableCell>
                <TableCell className="text-gray-900 font-medium">
                  {rating.numeric_value}
                </TableCell>
                <TableCell>
                  <div
                    className="w-[100px] border border-solid border-black p-2 text-center"
                    style={{
                      color: rating.text_colour?.hex,
                      backgroundColor: rating.background_colour?.hex,
                    }}
                  >
                    {rating.name}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalOpen(true);
                      setDeleteItemId(rating.id);
                    }}
                    disabled={!(actions.includes('admin') || actions.includes('delete'))}
                  >
                    <Trash2 className="h-5 w-5 text-gray-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {((filters.page - 1) * filters.limit) + 1}-
          {Math.min(filters.page * filters.limit, data.total)} of {data.total} results
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => filters.page > 1 && 
                  setFilters({ ...filters, page: filters.page - 1 })}
                className={filters.page <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext 
                onClick={() => filters.page < Math.ceil(data.total / filters.limit) && 
                  setFilters({ ...filters, page: filters.page + 1 })}
                className={filters.page >= Math.ceil(data.total / filters.limit) ? 
                  'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Rating</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this rating?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(false);
                setDeleteItemId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RatingList;