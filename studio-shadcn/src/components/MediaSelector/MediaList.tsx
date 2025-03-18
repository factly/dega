import React, { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getMedia } from "../../actions/media";
import deepEqual from "deep-equal";

interface Medium {
  id: string;
  url: {
    proxy?: string;
    raw: string;
  };
}

interface MediaListProps {
  onSelect: (medium: Medium | null) => void;
  selected: Medium | null;
  onUnselect: () => void;
  profile?: boolean;
}

interface Filters {
  page: number;
  limit: number;
  q?: string;
}

function MediaList({
  onSelect,
  selected,
  onUnselect,
  profile = false,
}: MediaListProps) {
  const dispatch = useDispatch();

  const [filters, setFilters] = React.useState<Filters>({
    page: 1,
    limit: 8,
  });

  const { media, total } = useSelector((state: any) => {
    const node = state.media.req.find((item: any) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        media: node.data.map((element: string) => state.media.details[element]),
        total: node.total,
      };

    return { media: [], total: 0 };
  });

  useEffect(() => {
    fetchMedia();
  }, [dispatch, filters]);

  const fetchMedia = () => {
    dispatch(getMedia(filters, profile));
  };

  const totalPages = Math.ceil(total / filters.limit);

  return (
    <div className="flex flex-col space-y-4">
      <Input
        placeholder="Search Media"
        onChange={(e) => setFilters({ ...filters, q: e.target.value })}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {media.map((item: Medium) => (
          <div key={item.id}>
            {selected && item.id === selected.id ? (
              <div className="relative">
                <Avatar
                  className="h-44 w-44 rounded-lg opacity-70 p-2 border-2 border-primary cursor-pointer"
                  onClick={() => {
                    onSelect(null);
                    onUnselect();
                  }}
                >
                  <AvatarImage
                    src={
                      item.url?.[
                        import.meta.env.VITE_ENABLE_IMGPROXY ? "proxy" : "raw"
                      ]
                    }
                    alt="Selected media"
                  />
                </Avatar>
                <CheckCircle2 className="absolute top-2 right-2 h-8 w-8 text-green-500" />
              </div>
            ) : (
              <div className="relative">
                <Avatar
                  className="h-44 w-44 rounded-lg p-2 border-2 border-transparent cursor-pointer"
                  onClick={() => onSelect(item)}
                >
                  <AvatarImage
                    src={
                      item.url?.[
                        import.meta.env.VITE_ENABLE_IMGPROXY ? "proxy" : "raw"
                      ]
                    }
                    alt="Media item"
                  />
                </Avatar>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: Math.max(1, filters.page - 1),
                  })
                }
                className={
                  filters.page <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around the current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (filters.page <= 3) {
                pageNum = i + 1;
              } else if (filters.page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = filters.page - 2 + i;
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setFilters({ ...filters, page: pageNum })}
                    isActive={pageNum === filters.page}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: Math.min(totalPages, filters.page + 1),
                  })
                }
                className={
                  filters.page >= totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default MediaList;
