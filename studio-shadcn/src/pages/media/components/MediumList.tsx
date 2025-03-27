import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MoreHorizontal, Download, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define types for component props and data
interface MediaItem {
  id: string | number;
  name: string;
  url?: {
    proxy?: string;
    raw?: string;
  };
}

interface MediaData {
  media: MediaItem[];
  total: number;
  loading: boolean;
}

interface Filters {
  page?: number;
  limit?: number;
  [key: string]: any;
}

interface MediumListProps {
  data: MediaData;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  actions?: string[];
}

function MediumList({
  data,
  filters,
  setFilters,
  actions = [],
}: MediumListProps) {
  // Calculate pagination values
  const currentPage = Number(filters.page) || 1;
  const pageSize = Number(filters.limit) || 10;
  const totalPages = Math.ceil(data.total / pageSize);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setFilters({ ...filters, page: pageNumber });
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setFilters({ ...filters, page: 1, limit: size });
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Media Grid - using 3 columns*/}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.media.map((item) => (
          <div key={item.id} className="relative group">
            <Link to={`/media/${item.id}/edit`} className="block">
              <Card className="overflow-hidden h-64 transition-all hover:shadow-md">
                <CardContent className="p-0 h-full bg-gray-50">
                  {item.url && (
                    <img
                      src={item.url.proxy || item.url.raw}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </CardContent>
              </Card>
            </Link>

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-md bg-white/90 hover:bg-white">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem asChild>
                    <Link
                      to={`/media/${item.id}/edit`}
                      className="flex items-center w-full cursor-pointer"
                    >
                      <span>Edit</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center cursor-pointer">
                    <Download className="h-4 w-4 mr-2" />
                    <span>Download</span>
                  </DropdownMenuItem>
                  {actions.includes("admin") && (
                    <DropdownMenuItem className="flex items-center text-red-500 cursor-pointer">
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data.total > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            {`${(currentPage - 1) * pageSize + 1}-${Math.min(
              currentPage * pageSize,
              data.total
            )} of ${data.total} results`}
          </p>

          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                  />
                </PaginationItem>
              )}

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={pageNum === currentPage}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>

          <select
            className="p-2 border rounded-md text-sm"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10 per page</option>
            <option value={15}>15 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>
      )}

      {/* No media items message */}
      {data.media.length === 0 && !data.loading && (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500 mb-4">No media items found</p>
          <Link to="/media/upload" className="text-primary hover:underline">
            Upload new media
          </Link>
        </div>
      )}
    </div>
  );
}

export default MediumList;
