import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Edit,
  Trash2,
  X,
  Check,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { deletePost } from "../../actions/posts";
import { getDifferenceInModifiedTime, formatDate } from "../../utils/date";
import QuickEdit from "./QuickEdit";

// Define interfaces for the component props and data structure
interface Post {
  id: number;
  title: string;
  status: "draft" | "ready" | "publish" | "future";
  published_date?: string | null;
  updated_at: string;
  authors: number[];
  created_at: string;
  medium?: any;
}

interface Author {
  display_name?: string;
  email?: string;
}

interface Authors {
  [key: number]: Author;
}

interface PostsState {
  posts: Post[];
  total: number;
  loading: boolean;
  tags: Record<number, any>;
  categories: Record<number, any>;
  authors: Authors;
}

interface Format {
  slug: string;
  id: number;
}

interface Filters {
  page: number;
  limit?: number;
  status?: string;
}

interface PostListProps {
  format: Format;
  filters: Filters;
  onPagination: (pageNumber: number, pageSize: number) => void;
  data: PostsState;
  fetchPosts: () => void;
  query: string;
  actions?: string[];
}

interface RootState {
  authors: {
    details: Authors;
  };
}

const PostList: React.FC<PostListProps> = ({
  format,
  filters,
  onPagination,
  data,
  fetchPosts,
  query,
  actions,
}) => {
  const dispatch = useDispatch();
  const [id, setID] = useState<number>(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([0]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteItemID, setDeleteItemID] = useState<number | null>(null);
  const navigate = useNavigate();

  // For debugging
  useEffect(() => {
    if (data.posts.length > 0) {
      console.log("Posts data in list:", data.posts);
    }
  }, [data.posts]);

  const authors = useSelector((state: RootState) => state.authors.details);

  const handleRowClick = (record: Post) => {
    navigate(
      format.slug === "article"
        ? `/posts/${record.id}/edit`
        : `/fact-checks/${record.id}/edit`
    );
  };

  const handleQuickEdit = (
    e: React.MouseEvent,
    item: Post,
    isOpen: boolean
  ) => {
    e.stopPropagation();
    isOpen ? setExpandedRowKeys([]) : setExpandedRowKeys([item.id]);
    setID(item.id);
  };

  const handleDelete = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    setModalOpen(true);
    setDeleteItemID(itemId);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteItemID !== null) {
      dispatch(deletePost(deleteItemID) as any).then(() => fetchPosts());
      setModalOpen(false);
      setDeleteItemID(null);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpen(false);
    setDeleteItemID(null);
  };

  // Filter posts based on selected tab if status filtering is not applied correctly from the API
  const getDisplayedPosts = () => {
    // If no query or query is 'all', return all posts
    if (!query || query === "all") {
      return data.posts;
    }

    // Otherwise filter by the status
    return data.posts.filter((item) => {
      // Make sure we're doing a case-insensitive comparison
      return item.status && item.status.toLowerCase() === query.toLowerCase();
    });
  };

  const displayedPosts = getDisplayedPosts();

  const getStatusBadge = (status: string) => {
    // Ensure we're normalizing the status to lowercase for consistent comparison
    const normalizedStatus = status ? status.toLowerCase() : "draft";

    switch (normalizedStatus) {
      case "publish":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            <CheckCircle className="h-3 w-3 mr-1" /> Published
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 border-gray-300"
          >
            <AlertCircle className="h-3 w-3 mr-1" /> Draft
          </Badge>
        );
      case "ready":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            <Check className="h-3 w-3 mr-1" /> Ready to Publish
          </Badge>
        );
      case "future":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            <Clock className="h-3 w-3 mr-1" /> Future Publish
          </Badge>
        );
      default:
        // Debug information to help identify unknown status types
        console.log("Unknown status:", status);
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  // Format and display the published date
  const displayPublishedDate = (item: Post) => {
    if (!item.published_date) {
      return "-";
    }
    try {
      // Try to format the date if it's valid
      return formatDate(item.published_date);
    } catch (error) {
      console.error("Error formatting date:", error, item.published_date);
      return item.published_date;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Title</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[200px]">Published Date</TableHead>
              <TableHead className="w-[200px]">Authors</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : displayedPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No posts found
                </TableCell>
              </TableRow>
            ) : (
              displayedPosts.map((item) => {
                const isOpen = item.id === expandedRowKeys[0];

                return (
                  <React.Fragment key={item.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-blue-50"
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
                            className={`font-medium ${
                              item.status === "draft"
                                ? "text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {item.title}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {displayPublishedDate(item)}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {getDifferenceInModifiedTime(item.updated_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {item.authors?.map((authorId) => (
                            <span
                              key={authorId}
                              className="font-medium text-gray-900"
                            >
                              {authors[authorId]?.display_name ||
                                authors[authorId]?.email ||
                                null}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => handleQuickEdit(e, item, isOpen)}
                          >
                            {isOpen ? (
                              <X className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Edit className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => handleDelete(e, item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {isOpen && (
                      <TableRow>
                        <TableCell colSpan={5} className="p-0">
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(filters.page - 1) * (filters.limit || 10) + 1}-
            {Math.min(filters.page * (filters.limit || 10), data.total)} of{" "}
            {data.total} results
          </p>
          <Pagination>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onPagination(filters.page - 1, filters.limit || 10)
                }
                disabled={filters.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onPagination(filters.page + 1, filters.limit || 10)
                }
                disabled={filters.page * (filters.limit || 10) >= data.total}
              >
                Next
              </Button>
              <select
                className="h-8 rounded-md border border-input bg-background px-3"
                value={filters.limit || 10}
                onChange={(e) => onPagination(1, parseInt(e.target.value))}
              >
                <option value={10}>10 per page</option>
                <option value={15}>15 per page</option>
                <option value={20}>20 per page</option>
              </select>
            </div>
          </Pagination>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Post</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this post?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button size="sm" variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button size="sm" variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostList;
