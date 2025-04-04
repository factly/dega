import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Trash2, Ellipsis, Pencil } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePost } from "../../actions/posts";
import { getDifferenceInModifiedTime, formatDate } from "../../utils/date";
import QuickEdit from "./QuickEdit";
import { renderStatusBadge } from "../../components/statusBadge/index";

// interfaces for the component props and data structure
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
  data: PostsState;
  fetchPosts: () => void;
  query: string;
  actions?: string[];
  onPagination?: (pageNumber: number, pageSize: number) => void;
  form?: any;
  onSave?: (values: any) => void;
}

interface RootState {
  authors: {
    details: Authors;
  };
}

const PostList: React.FC<PostListProps> = ({
  format,
  data,
  fetchPosts,
  query,
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

  // Memoize handlers to prevent unnecessary re-renders
  const handleQuickEdit = useCallback(
    (e: React.MouseEvent, item: Post) => {
      e.stopPropagation();
      const isOpen = item.id === expandedRowKeys[0];
      setExpandedRowKeys(isOpen ? [] : [item.id]);
      setID(item.id);
    },
    [expandedRowKeys]
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent, item: Post) => {
      e.stopPropagation();
      navigate(
        format.slug === "article"
          ? `/posts/${item.id}/edit`
          : `/fact-checks/${item.id}/edit`
      );
    },
    [navigate, format.slug]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, itemId: number) => {
      e.stopPropagation();
      setModalOpen(true);
      setDeleteItemID(itemId);
    },
    []
  );

  const confirmDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (deleteItemID !== null) {
        dispatch(deletePost(deleteItemID) as any)
          .then(() => {
            setModalOpen(false);
            setDeleteItemID(null);
            // Only fetch after the delete is complete
            setTimeout(() => fetchPosts(), 100);
          })
          .catch(() => {
            setModalOpen(false);
            setDeleteItemID(null);
          });
      }
    },
    [deleteItemID, dispatch, fetchPosts]
  );

  const cancelDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpen(false);
    setDeleteItemID(null);
  }, []);

  // Filter posts based on selected tab if status filtering is not applied correctly from the API
  const getDisplayedPosts = () => {
    // If the posts array is empty, return empty array
    if (!data.posts || data.posts.length === 0) {
      return [];
    }

    // If no query or query is 'all', return all posts
    if (!query || query === "all") {
      return data.posts;
    }

    // Otherwise filter by the status with more robust handling
    return data.posts.filter((item) => {
      // Handle case where item might be undefined or null
      if (!item) {
        console.warn("Found undefined item in posts array");
        return false;
      }

      // Handle case where status might be missing
      if (item.status === undefined || item.status === null) {
        console.warn(`Post ${item.id} has no status property`, item);
        return false;
      }

      // Make sure we're doing a case-insensitive comparison
      const itemStatus = String(item.status).toLowerCase();
      const queryStatus = query.toLowerCase();
      return itemStatus === queryStatus;
    });
  };

  const displayedPosts = getDisplayedPosts();

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
    <div className="pb-4 overflow-auto">
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Title</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[200px]">Published Date</TableHead>
              <TableHead className="w-[200px]">Authors</TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
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
                const isOpen = expandedRowKeys.includes(item.id);

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
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>{item.title}</span>
                        </Link>
                      </TableCell>
                      <TableCell>{renderStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{displayPublishedDate(item)}</span>
                          <span className="text-gray-500 text-sm">
                            {getDifferenceInModifiedTime(item.updated_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {item.authors?.length > 0
                            ? item.authors.map((authorId) => (
                                <span key={authorId}>
                                  {authors[authorId]?.display_name ||
                                    authors[authorId]?.email ||
                                    null}
                                </span>
                              ))
                            : "-"}
                        </div>
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
                              onClick={(e) => handleEditClick(e, item)}
                              className="cursor-pointer"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleQuickEdit(e, item)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              <span>Quick Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteClick(e, item.id)}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
