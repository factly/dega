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
import { deletePage } from "../../../actions/pages";
import { Link } from "react-router-dom";
import QuickEdit from "../../../components/List/QuickEdit";
import useNavigation from "../../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { renderStatusBadge } from "../../../components/statusBadge/index";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

interface Page {
  id: number;
  title: string;
  status: string;
  updated_at?: string;
  created_at?: string;
  tag_ids?: number[];
  category_ids?: number[];
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

interface Format {
  id: string;
  slug: string;
  [key: string]: any;
}

interface PageListProps {
  format: Format;
  data: {
    pages: Page[];
    loading: boolean;
    total: number;
    tags: Record<number, Tag>;
    categories: Record<number, Category>;
  };
  filters: {
    page?: number;
    limit?: number;
    tag?: string[];
    category?: string[];
    sort?: string;
    sortBy?: string;
    [key: string]: any;
  };
  onPagination: (page: number, limit: number) => void;
  fetchPages: () => void;
  isMobile?: boolean;
  sortOrder?: "asc" | "desc";
  onSortToggle?: () => void;
  sortBy?: string;
  onSortByChange?: (column: string) => void;
}

function PageList({
  format,
  data,
  filters,
  onPagination,
  fetchPages,
  isMobile = false,
  sortOrder = "desc",
  onSortToggle,
  sortBy = "date",
  onSortByChange,
}: PageListProps) {
  const dispatch = useAppDispatch();
  const [id, setID] = useState<number>(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([0]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteItemID, setDeleteItemID] = useState<number | null>(null);

  const navigate = useNavigation();

  // Memoize handlers to prevent unnecessary re-renders
  const handleEditClick = useCallback(
    (e: React.MouseEvent, item: Page) => {
      e.stopPropagation();
      navigate(`/pages/${item.id}/edit`);
    },
    [navigate]
  );

  const handleQuickEdit = useCallback(
    (e: React.MouseEvent, item: Page) => {
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

  const handleDeletePage = useCallback(() => {
    if (deleteItemID) {
      dispatch(deletePage(deleteItemID) as any).then(() => fetchPages());
      setModalOpen(false);
      setDeleteItemID(null);
    }
  }, [deleteItemID, dispatch, fetchPages]);

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

  // Function to format date - simplified for example
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
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

  // Check if there are any pages to display
  const hasPagesData = !data.loading && data.pages && data.pages.length > 0;

  return (
    <div className="space-y-4 pb-4 overflow-auto">
      {data.loading ? (
        <div className="rounded-md">
          <Table>
            <TableHeader className="text-[13px]">
              <TableRow>
                <TableHead className="min-w-[250px] w-[40%]">Title</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
                <TableHead className="w-[30%]">Last Modified</TableHead>
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
      ) : hasPagesData ? (
        <div className="rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[250px] w-[40%] text-[13px]">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={handleSortByTitleToggle}
                  >
                    Title
                    <ChevronsUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="w-[15%] text-[13px]">Status</TableHead>
                <TableHead className="w-[25%] text-[13px]">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={handleSortByDateToggle}
                  >
                    Last Modified
                    <ChevronsUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="w-[20%] text-center text-[13px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.pages.map((item) => {
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
                      onClick={() => navigate(`/pages/${item.id}/edit`)}
                    >
                      <TableCell className="py-3">
                        <Link
                          to={`/pages/${item.id}/edit`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.title}
                        </Link>
                      </TableCell>
                      <TableCell>{renderStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDate(item.updated_at)}</span>
                          <span className="text-gray-400 text-[13px]">
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
                        <TableCell colSpan={4} className="p-0">
                          <div className="p-4 bg-white hover:bg-white">
                            <QuickEdit
                              data={item}
                              page={true}
                              setID={setID}
                              slug={format.slug}
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
          contentType="pages"
          title="No pages found"
          description="Your pages list is empty"
          isMobile={isMobile}
        />
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base">Delete Confirmation</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this page?
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePage}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PageList;
