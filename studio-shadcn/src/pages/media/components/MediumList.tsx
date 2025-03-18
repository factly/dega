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

// Define types for component props and data
interface MediaItem {
  id: string | number;
  name: string;
  url: {
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

/**
 * MediumList component displays a grid of media items with pagination
 * @param data - Object containing media items array and total count
 * @param filters - Current filter state including pagination info
 * @param setFilters - Function to update filters
 */
function MediumList({ data, filters, setFilters }: MediumListProps) {
  // Calculate pagination values
  const currentPage = filters.page || 1;
  const pageSize = filters.limit || 10;
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
      {/* Grid layout for media items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {data.media.map((item) => (
          <Link key={item.id} to={`/media/${item.id}/edit`} className="block">
            <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <CardContent className="p-0">
                <img
                  alt={item.name}
                  src={
                    item.url
                      ? `${
                          item.url[
                            import.meta.env.VITE_ENABLE_IMGPROXY
                              ? "proxy"
                              : "raw"
                          ]
                        }?gravity:sm/resize:fill:220:220`
                      : ""
                  }
                  className="w-full h-64 object-cover object-center rounded-t-lg"
                  title={item.name}
                />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {data.total > 0 && (
        <div className="flex items-center justify-between">
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

              {/* Generate page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around the current page
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

          {/* Page size selector */}
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
    </div>
  );
}

export default MediumList;
