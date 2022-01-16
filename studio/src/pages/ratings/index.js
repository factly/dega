import React from 'react';
import RatingList from './components/RatingList';
import { Space, Button, Row } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getRatings } from '../../actions/ratings';
import deepEqual from 'deep-equal';

function Ratings({ permission }) {
  const { actions } = permission;
  const dispatch = useDispatch();
  const query = new URLSearchParams(useLocation().search);
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  query.set('page', filters.page);
  window.history.replaceState({}, '', `${window.PUBLIC_URL}${useLocation().pathname}?${query}`);
  const { ratings, total, loading } = useSelector((state) => {
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

  React.useEffect(() => {
    fetchRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchRatings = () => {
    dispatch(getRatings(filters));
  };
  return (
    <Space direction="vertical">
      <Row justify="end">
        <Link key="1" to="/ratings/create">
          <Button
            disabled={!(actions.includes('admin') || actions.includes('create'))}
            type="primary"
          >
            New Rating
          </Button>
        </Link>
      </Row>

      <RatingList
        actions={actions}
        data={{ ratings, total, loading }}
        filters={filters}
        setFilters={setFilters}
        fetchRatings={fetchRatings}
      />
    </Space>
  );
}

export default Ratings;
