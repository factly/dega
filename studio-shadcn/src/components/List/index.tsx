import React, { useState, useCallback } from "react";
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
import { Trash2, Edit, Ellipsis, Pencil, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { deletePost } from "../../actions/posts";
import { Link } from "react-router-dom";
import QuickEdit from "../../components/List/QuickEdit";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { renderStatusBadge } from "../../components/statusBadge/index";
import EmptyState from "@/components/EmptyState";

interface Post {
  updated_at?: string;
  created_at?: string;
  published_date?: string;
  tag_ids?: number[];
  category_ids?: number[];
  author_ids?: number[];
  authors?: number[] | Array<{ id: number; display_name: string }>;
  id: number;
  title: string;
  slug: string;
  status: "publish" | "draft" | "ready";
  categories?: number[];
  tags?: number[];
  claims?: number[];
  [key: string]: any;
}

interface Tag {
  id: number;
  name: string;
  [key: string]: any;
}

interface Category {
  id: number;
  name: string;
  [key: string]: any;
}

interface Author {
  id: number;
  display_name: string;
  [key: string]: any;
}

export interface Format {
  id: number;
  name: string;
  slug: string;
  [key: string]: any;
}

interface PostListProps {
  format: Format;
  data: {
    posts: Post[];
    loading: boolean;
    total: number;
    tags: Record<number, Tag>;
    categories: Record<number, Category>;
    authors: Record<number, Author>;
  };
  filters: {
    page?: number;
    limit?: number;
    tag?: string[];
    category?: string[];
    author?: string[];
    sort?: string;
    sortBy?: string;
    [key: string]: any;
  };
  onPagination: (page: number, limit: number) => void;
  fetchPosts: () => void;
  isMobile?: boolean;
  sortOrder?: "asc" | "desc";
  onSortToggle?: () => void;
  sortBy?: string;
  onSortByChange?: (column: string) => void;
}

function PostList({
  format,
  data,
  fetchPosts,
  isMobile,
  sortOrder = "desc",
  onSortToggle,
  sortBy = "date",
  onSortByChange,
}: PostListProps) {
  const dispatch = useAppDispatch();
  const [id, setID] = useState<number>(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([0]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteItemID, setDeleteItemID] = useState<number | null>(null);

  const navigate = useNavigation();

  // Memoize handlers to prevent unnecessary re-renders
  const handleEditClick = useCallback(
    (e: React.MouseEvent, item: Post) => {
      e.stopPropagation();
      navigate(`/posts/${item.id}/edit`);
    },
    [navigate]
  );

  const handleQuickEdit = useCallback(
    (e: React.MouseEvent, item: Post) => {
      e.stopPropagation();
      const isOpen = item.id === expandedRowKeys[0];
      setExpandedRowKeys(isOpen ? [] : [item.id]);
      setID(item.id);
    },
    [expandedRowKeys]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, itemId: number) => {
      e.stopPropagation();
      setModalOpen(true);
      setDeleteItemID(itemId);
    },
    []
  );

  const handleDeletePost = useCallback(() => {
    if (deleteItemID) {
      dispatch(deletePost(deleteItemID) as any).then(() => fetchPosts());
      setModalOpen(false);
      setDeleteItemID(null);
    }
  }, [deleteItemID, dispatch, fetchPosts]);

  // Function to format date - simplified for example
  const formatDate = (dateString?: string) => {
    if (!dateString) return "---";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  // Function to get time difference from now
  const getDifferenceInModifiedTime = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    }
  };

  // Function to render author names
  const renderAuthors = (post: Post) => {
    if (
      Array.isArray(post.authors) &&
      post.authors.length > 0 &&
      typeof post.authors[0] === "object"
    ) {
      const authorNames = post.authors
        .map((author: any) => author.display_name || author.name)
        .filter(Boolean);

      if (authorNames.length > 0) {
        return <div>{authorNames.join(", ")}</div>;
      }
    }

    if (
      Array.isArray(post.authors) &&
      post.authors.length > 0 &&
      typeof post.authors[0] !== "object"
    ) {
      const authorNames = post.authors
        .map((id) => {
          const author = data.authors[id];
          return author ? author.display_name : null;
        })
        .filter(Boolean);

      if (authorNames.length > 0) {
        return <div>{authorNames.join(", ")}</div>;
      }
    }

    // No author information found
    return "---";
  };

  // Sort handlers
  const handleSortByTitleToggle = () => {
    if (onSortByChange) {
      onSortByChange("title");
    }
    if (sortBy === "title" && onSortToggle) {
      onSortToggle();
    }
  };

  const handleSortByDateToggle = () => {
    if (onSortByChange) {
      onSortByChange("date");
    }
    if (sortBy === "date" && onSortToggle) {
      onSortToggle();
    }
  };

  // Check if there are any posts to display and if we're not loading
  const hasPostsData = !data.loading && data.posts && data.posts.length > 0;

  return (
    <div className="space-y-4 pb-4 overflow-auto">
      {data.loading ? (
        <div className="rounded-md">
          <Table>
            <TableHeader className="text-[13px]">
              <TableRow>
                <TableHead className="min-w-[250px] w-[30%]">Title</TableHead>
                <TableHead className="w-[15%]">Author</TableHead>
                <TableHead className="w-[15%]">Status</TableHead>
                <TableHead className="w-[30%]">Published Date</TableHead>
                <TableHead className="w-[10%] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="py-3">
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-4/5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Skeleton className="h-6 w-10" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : hasPostsData ? (
        <div className="rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[250px] w-[30%] text-[13px]">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={handleSortByTitleToggle}
                  >
                    Title
                    <ChevronsUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="w-[15%] text-[13px]">Author</TableHead>
                <TableHead className="w-[15%] text-[13px]">Status</TableHead>
                <TableHead className="w-[30%] text-[13px]">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={handleSortByDateToggle}
                  >
                    Published Date
                    <ChevronsUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="w-[10%] text-center text-[13px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.posts.map((item) => {
                const isOpen = item.id === expandedRowKeys[0];
                // Ensure tag_ids and category_ids are always arrays, even if undefined
                const tagIds = item.tag_ids || [];
                const categoryIds = item.category_ids || [];

                return (
                  <React.Fragment key={item.id}>
                    <TableRow
                      className={`cursor-pointer ${
                        isOpen ? "bg-[#F0F5FF]" : "hover:bg-blue-50"
                      }`}
                      onClick={() => navigate(`/posts/${item.id}/edit`)}
                    >
                      <TableCell className="py-3">
                        <Link
                          to={`/posts/${item.id}/edit`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.title}
                        </Link>
                      </TableCell>
                      <TableCell>{renderAuthors(item)}</TableCell>
                      <TableCell>{renderStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDate(item.published_date)}</span>
                          <span className="text-gray-400 text-[13px]">
                            Last modified:{" "}
                            {getDifferenceInModifiedTime(item.updated_at)}
                          </span>
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => handleQuickEdit(e, item)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              <span>Quick Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
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
                          <div className="p-4 bg-white">
                            <QuickEdit
                              data={item}
                              page={false}
                              setID={setID}
                              slug={format.slug}
                              createdAt={item.created_at}
                              onQuickEditUpdate={() => setExpandedRowKeys([])}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          contentType="posts"
          title="No posts found"
          description="Your posts list is empty"
          isMobile={isMobile}
        />
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Confirmation</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this post?
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePost}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PostList;
