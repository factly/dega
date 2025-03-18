import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getEventName } from "../../../../utils/event";
import { getDateAndTimeFromString } from "../../../../utils/date";
import { ClipboardList } from "lucide-react";

// Define TypeScript interfaces
interface WebhookLog {
  id: string;
  event: string;
  created_at: string;
}

interface WebhookLogsData {
  webhooklogs: WebhookLog[];
  loading: boolean;
  total: number;
}

interface Filters {
  page: number;
  limit: number;
}

interface WebhookLogsListProps {
  data: WebhookLogsData;
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  fetchWebhooks?: () => void; // Make this prop optional with the same type as in the parent
}

function WebhookLogsList({
  data,
  filters,
  setFilters,
  fetchWebhooks,
}: WebhookLogsListProps): React.ReactElement {
  // Calculate pagination values
  const totalPages = Math.ceil(data.total / filters.limit);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Filter page numbers to show a reasonable amount
  const visiblePageNumbers = pageNumbers
    .filter(
      (num) =>
        num === 1 ||
        num === totalPages ||
        (num >= filters.page - 1 && num <= filters.page + 1)
    )
    .sort((a, b) => a - b);

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  const handleLimitChange = (limit: number) => {
    setFilters({ page: 1, limit });
  };

  return (
    <div className="space-y-4">
      {data.loading ? (
        <div className="flex justify-center items-center py-8">
          <ClipboardList className="mr-2 h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.webhooklogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{getEventName(log.event)}</TableCell>
                  <TableCell>
                    {getDateAndTimeFromString(log.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(filters.page - 1) * filters.limit + 1} to{" "}
              {Math.min(filters.page * filters.limit, data.total)} of{" "}
              {data.total} entries
            </div>

            <div className="flex items-center space-x-2">
              <select
                className="h-9 rounded-md border border-input bg-background px-3"
                value={filters.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, filters.page - 1))
                      }
                      className={
                        filters.page <= 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {visiblePageNumbers.map((pageNumber, index) => {
                    // Add ellipsis if there are gaps in the sequence
                    if (
                      index > 0 &&
                      pageNumber - visiblePageNumbers[index - 1] > 1
                    ) {
                      return (
                        <React.Fragment key={`ellipsis-${pageNumber}`}>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink
                              isActive={pageNumber === filters.page}
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      );
                    }

                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          isActive={pageNumber === filters.page}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, filters.page + 1))
                      }
                      className={
                        filters.page >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default WebhookLogsList;
