import React, { useEffect, useState } from "react";
import RatingList from "./components/RatingList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import RootState from "../../store/index";
import { getRatings } from "../../actions/ratings";
import deepEqual from "deep-equal";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { PlusCircle } from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import Pagination from "../../components/Pagination";

// Type definitions
interface Permission {
  actions: string[];
}

interface RatingFilters {
  page: number;
  limit: number;
}

interface Rating {
  id: string;
  name: string;
  numeric_value: number;
  background_colour?: {
    hex: string;
  };
  text_colour?: {
    hex: string;
  };
}

interface RatingsState {
  req: {
    query: RatingFilters;
    data: string[];
    total: number;
  }[];
  details: {
    [key: string]: Rating;
  };
  loading: boolean;
}

interface RootState {
  ratings: RatingsState;
}

function Ratings({
  permission = { actions: [] },
}: {
  permission?: Permission;
}): React.ReactElement {
  const { actions } = permission;
  const dispatch = useAppDispatch();
  const [searchText, setSearchText] = useState<string>("");

  const [filters, setFilters] = React.useState<RatingFilters>({
    page: 1,
    limit: 20,
  });

  const { ratings, total, loading } = useSelector((state: RootState) => {
    const node = state.ratings.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        ratings: node.data.map((element) => state.ratings.details[element]),
        total: node.total,
        loading: state.ratings.loading,
      };
    return { ratings: [], total: 0, loading: state.ratings.loading };
  });

  useEffect(() => {
    fetchRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchRatings = (): void => {
    dispatch(getRatings(filters));
  };

  // Filter ratings based on search text
  const filteredRatings = ratings.filter((rating) =>
    rating.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handlePageSizeChange = (size: number) => {
    setFilters({ page: 1, limit: size });
  };

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  // Get sidebar state from Redux store
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );

  // Calculate left margin based on sidebar state
  const sidebarWidth = isCollapsed ? "89px" : "265px";

  // Define the header height (including padding)
  const headerHeight = "calc(1.5rem + 2.5rem + 1rem)"; // top padding + height + bottom padding

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col h-full">
      <Helmet title={"Ratings"} />

      {/* Header */}
      <div
        className="fixed top-0 z-10 bg-white"
        style={{
          left: sidebarWidth,
          right: 0,
          height: headerHeight,
          transition: "left 0.3s ease",
        }}
      >
        <div className="flex justify-between items-center h-full px-6 pt-1">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Input
                placeholder="Search ratings..."
                value={searchText}
                onChange={handleSearchChange}
                className="h-10"
              />
            </div>
          </div>
          <div>
            <Link to="/ratings/create">
              <Button size="lg" className="flex items-center py-2">
                <PlusCircle className="h-4 w-4" />
                Create Rating
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="absolute overflow-auto"
        style={{
          top: headerHeight,
          left: sidebarWidth,
          right: 0,
          bottom: "64px",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          paddingBottom: "1.5rem",
          paddingTop: "1rem",
          transition: "left 0.3s ease, top 0.3s ease",
        }}
      >
        <RatingList
          actions={actions}
          data={{ ratings: filteredRatings, total, loading }}
          filters={filters}
          setFilters={setFilters}
          fetchRatings={fetchRatings}
        />
      </div>

      {/* Footer with Pagination */}
      <div
        className="fixed bottom-0 z-10 bg-white"
        style={{
          left: sidebarWidth,
          right: 0,
          height: "64px",
          transition: "left 0.3s ease",
        }}
      >
        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={filters.limit}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}

export default Ratings;
