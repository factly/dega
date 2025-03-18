import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Trash2, X, Check, PencilLine } from "lucide-react";

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

import { deletePost } from "../../actions/posts";
import { formatDate, getDifferenceInModifiedTime } from "../../utils/date";
import QuickEdit from "./QuickEdit";

// Define types
interface Author {
  display_name?: string;
  email?: string;
}

interface Post {
  id: number;
  title: string;
  status: string;
  published_date?: string;
  updated_at: string;
  authors?: number[];
  created_at: string;
}

interface FormatType {
  slug: string;
}

interface FiltersType {
  page: number;
  limit: number;
  status?: string;
}

interface DataType {
  posts: Post[];
  loading: boolean;
  total: number;
}

interface FactCheckListProps {
  actions: string[];
  format: FormatType;
  filters: FiltersType;
  onPagination: (pageNumber: number, pageSize: number) => void;
  data: DataType;
  fetchPosts: () => void;
}

interface RootState {
  authors: {
    details: Record<number, Author>;
  };
}

const FactCheckList: React.FC<FactCheckListProps> = ({
  actions,
  format,
  filters,
  onPagination,
  data,
  fetchPosts,
}) => {
  const dispatch = useDispatch();
  const [id, setID] = useState<number>(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([0]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteItemID, setDeleteItemID] = useState<number | null>(null);
  const navigate = useNavigate();

  const authors = useSelector((state: RootState) => state.authors.details);

  const handleRowClick = (record: Post) => {
    navigate(
      format.slug === "article"
        ? `/posts/${record.id}/edit`
        : `/fact-checks/${record.id}/edit`
    );
  };

  const handleQuickEditButtonClick = (e: React.MouseEvent, item: Post) => {
    e.stopPropagation();
    const isOpen = item.id === expandedRowKeys[0];
    isOpen ? setExpandedRowKeys([]) : setExpandedRowKeys([item.id]);
    setID(item.id);
  };

  const handleDeleteButtonClick = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    setModalOpen(true);
    setDeleteItemID(itemId);
  };

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteItemID !== null) {
      dispatch(deletePost(deleteItemID) as any).then(() => fetchPosts());
      setModalOpen(false);
      setDeleteItemID(null);
    }
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpen(false);
    setDeleteItemID(null);
  };

  // Calculate status for display
  const getStatusFromQuery = () => {
    if (filters.status === "publish") return "Published";
    if (filters.status === "future") return "Future Publish";
    if (filters.status === "ready") return "Ready to Publish";
    if (filters.status === "draft") return "Drafts";
    return "All";
  };

  return (
    <div className="space-y-4">
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-96">Title</TableHead>
              <TableHead className="w-48">Published Date</TableHead>
              <TableHead className="w-48">Authors</TableHead>
              <TableHead className="w-48">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No fact-checks found
                </TableCell>
              </TableRow>
            ) : (
              data.posts.map((item) => (
                <React.Fragment key={item.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(item)}
                  >
                    <TableCell>
                      <Link
                        to={
                          format.slug === "article"
                            ? `/posts/${item.id}/edit`
                            : `/fact-checks/${item.id}/edit`
                        }
                        className="flex items-center"
                      >
                        <span
                          className={`text-base font-semibold ${
                            ["draft", "ready", "publish"].includes(
                              filters.status as string
                            )
                              ? "text-gray-900"
                              : item.status === "draft"
                              ? "text-gray-500"
                              : "text-gray-900"
                          }`}
                        >
                          {item.title}
                        </span>
                        {["draft", "ready", "publish"].includes(
                          filters.status as string
                        ) ? null : item.status === "draft" ? (
                          <Edit className="ml-2 h-4 w-4 text-gray-500" />
                        ) : item.status === "ready" ? (
                          <Check className="ml-2 h-4 w-4 text-gray-900" />
                        ) : null}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">
                          {item.published_date
                            ? formatDate(item.published_date)
                            : "---"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getDifferenceInModifiedTime(item.updated_at)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {item.authors?.map((authorId) => (
                          <p
                            key={authorId}
                            className="font-medium text-gray-900"
                          >
                            {authors[authorId]?.display_name
                              ? authors[authorId]?.display_name
                              : authors[authorId]?.email
                              ? authors[authorId]?.email
                              : null}
                          </p>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={
                            !(
                              actions.includes("admin") ||
                              actions.includes("update")
                            )
                          }
                          onClick={(e) => handleQuickEditButtonClick(e, item)}
                        >
                          {item.id === expandedRowKeys[0] ? (
                            <X className="h-4 w-4 text-gray-500" />
                          ) : (
                            <PencilLine className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={
                            !(
                              actions.includes("admin") ||
                              actions.includes("delete")
                            )
                          }
                          onClick={(e) => handleDeleteButtonClick(e, item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRowKeys.includes(item.id) && (
                    <TableRow>
                      <TableCell colSpan={4} className="p-0">
                        <QuickEdit
                          data={item}
                          setID={setID}
                          slug={format.slug}
                          createdAt={item.created_at}
                          onQuickEditUpdate={() => setExpandedRowKeys([])}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {data.total > 0
            ? `${(filters.page - 1) * filters.limit + 1}-${Math.min(
                filters.page * filters.limit,
                data.total
              )} of ${data.total} results`
            : "0 results"}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPagination(filters.page - 1, filters.limit)}
            disabled={filters.page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPagination(filters.page + 1, filters.limit)}
            disabled={filters.page * filters.limit >= data.total}
          >
            Next
          </Button>
          <select
            className="h-8 rounded-md border border-gray-300 px-2"
            value={filters.limit}
            onChange={(e) => onPagination(1, Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => !open && setModalOpen(false)}
      >
        <DialogContent className="max-w-sm p-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Post</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this post?
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

export default FactCheckList;
