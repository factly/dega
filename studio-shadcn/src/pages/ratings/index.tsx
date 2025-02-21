import React from 'react';
import RatingList from './components/RatingList';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getRatings } from '../../actions/ratings';
import deepEqual from 'deep-equal';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';


interface Rating {
  // Add specific rating properties here
  id: string;
  // ... other rating properties
}

interface RootState {
  ratings: {
    req: {
      query: Filters;
      data: string[];
      total: number;
    }[];
    details: Record<string, Rating>;
    loading: boolean;
  };
}

interface Filters {
  page: number;
  limit: number;
}


function Ratings() {
  const dispatch = useDispatch();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  
  const [filters, setFilters] = React.useState<Filters>({
    page: 1,
    limit: 20,
  });

  query.set('page', filters.page.toString());
  window.history.replaceState(
    {}, 
    '', 
    `${import.meta.env.PUBLIC_URL}${location.pathname}?${query}`
  );

  const { ratings, total, loading } = useSelector((state: RootState) => {
    const node = state.ratings.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node) {
      return {
        ratings: node.data.map((element) => state.ratings.details[element]),
        total: node.total,
        loading: state.ratings.loading,
      };
    }
    return { ratings: [], total: 0, loading: state.ratings.loading };
  });

  React.useEffect(() => {
    fetchRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchRatings = () => {
    dispatch(getRatings(filters));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <Helmet title={'Ratings'} />
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-[#1E1E1E] m-0">
          Ratings
        </h3>
        
        <Link to="/ratings/create">
          <Button
            variant="default"
          >
            New Rating
          </Button>
        </Link>
      </div>

      <RatingList
        data={{ ratings, total, loading }}
        filters={filters}
        setFilters={setFilters}
        fetchRatings={fetchRatings}
      />
    </div>
  );
}

export default Ratings;