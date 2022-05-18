import React from 'react';
import FormatList from './components/FormatList';
import { Space, Button, Row } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFormats } from '../../actions/formats';
import deepEqual from 'deep-equal';
import Loader from '../../components/Loader';
import { Helmet } from 'react-helmet';

function Formats({ permission }) {
  const { actions } = permission;
  const dispatch = useDispatch();
  const query = new URLSearchParams(useLocation().search);
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  query.set('page', filters.page);
  window.history.replaceState({}, '', `${window.PUBLIC_URL}${useLocation().pathname}?${query}`);
  const { formats, total, loading } = useSelector((state) => {
    const node = state.formats.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        formats: node.data.map((element) => state.formats.details[element]),
        total: node.total,
        loading: state.formats.loading,
      };
    return { formats: [], total: 0, loading: state.formats.loading };
  });

  React.useEffect(() => {
    fetchFormats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchFormats = () => {
    dispatch(getFormats(filters));
  };

  return loading ? (
    <Loader />
  ) : (
    <Space direction="vertical">
      <Helmet title={'Formats'} />
      <Row justify="end">
        <Link key="1" to="/advanced/formats/create">
          <Button
            disabled={!(actions.includes('admin') || actions.includes('create'))}
            type="primary"
          >
            New Format
          </Button>
        </Link>
      </Row>

      <FormatList
        actions={actions}
        data={{ formats, total, loading }}
        filters={filters}
        setFilters={setFilters}
        fetchFormats={fetchFormats}
      />
    </Space>
  );
}

export default Formats;
