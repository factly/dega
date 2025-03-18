import React, { useEffect, useState } from "react";
import RatingList from "./components/RatingList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getRatings } from "../../actions/ratings";
import deepEqual from "deep-equal";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { PlusCircle } from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";

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
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const [searchText, setSearchText] = useState<string>("");

  const [filters, setFilters] = React.useState<RatingFilters>({
    page: 1,
    limit: 20,
  });

  query.set("page", filters.page.toString());
  window.history.replaceState(
    {},
    "",
    `${import.meta.env.VITE_PUBLIC_URL}${location.pathname}?${query}`
  );

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

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col space-y-4">
      <Helmet title={"Ratings"} />
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Input
              placeholder="Search ratings..."
              value={searchText}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div>
          <Link to="/ratings/create">
            <Button className="flex items-center">
              <PlusCircle className="h-4 w-4" />
              New Rating
            </Button>
          </Link>
        </div>
      </div>

      <RatingList
        actions={actions}
        data={{ ratings: filteredRatings, total, loading }}
        filters={filters}
        setFilters={setFilters}
        fetchRatings={fetchRatings}
      />
    </div>
  );
}

export default Ratings;
