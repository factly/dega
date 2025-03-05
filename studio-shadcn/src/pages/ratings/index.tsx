import React, { useEffect } from "react";
import RatingList from "./components/RatingList";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getRatings } from "../../actions/ratings";
import deepEqual from "deep-equal";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { PlusCircle } from "lucide-react";

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
  [key: string]: any;
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
}): JSX.Element {
  const { actions } = permission;
  const dispatch = useDispatch();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

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

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col space-y-4">
      <Helmet title={"Ratings"} />
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="m-0 inline text-[#1E1E1E]">Ratings</h3>
        </div>
        <div>
          <Link to="/ratings/create">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New Rating
            </Button>
          </Link>
        </div>
      </div>

      <RatingList
        actions={actions}
        data={{ ratings, total, loading }}
        filters={filters}
        setFilters={setFilters}
        fetchRatings={fetchRatings}
      />
    </div>
  );
}

export default Ratings;
