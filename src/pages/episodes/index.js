import React from 'react';
import EpisodeList from './components/EpisodeList';
import { Space, Button, Form, Col, Row, Select, Input } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import deepEqual from 'deep-equal';
import { getEpisodes } from '../../actions/episodes';

function Episodes({ permission }) {
  //const { actions } = permission;
  const actions = ['admin'];
  const dispatch = useDispatch();
  const query = new URLSearchParams(useLocation().search);
  const [filters, setFilters] = React.useState({
    page: query.get('page') ? query.get('page') : 1,
    limit: 20,
    sort: query.get('sort'),
    q: query.get('q'),
  });
  Object.keys(filters).forEach(function (key) {
    if (filters[key] && key !== 'limit') query.set(key, filters[key]);
  });
  window.history.replaceState({}, '', `${window.PUBLIC_URL}${useLocation().pathname}?${query}`);
  const [form] = Form.useForm();
  const { Option } = Select;

  const { episodes, total, loading } = useSelector((state) => {
    const node = state.episodes.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        episodes: node.data.map((element) => state.episodes.details[element]),
        total: node.total,
        loading: state.episodes.loading,
      };
    return { episodes: [], total: 0, loading: state.episodes.loading };
  });

  React.useEffect(() => {
    fetchEpisodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchEpisodes = () => {
    dispatch(getEpisodes(filters));
  };
  return (
    <Space direction="vertical">
      <Row>
        <Col span={8}>
          <Link key="1" to="/episodes/create">
            <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
              Create New
            </Button>
          </Link>
        </Col>
        <Col span={8} offset={8}>
          <Form
            initialValues={filters}
            form={form}
            name="filters"
            layout="inline"
            onFinish={(values) => setFilters({ ...filters, ...values })}
            style={{ maxWidth: '100%' }}
            onValuesChange={(changedValues, allValues) => {
              let changedKey = Object.keys(changedValues)[0];
              query.set(changedKey, changedValues[changedKey]);
              if (!changedValues.q) {
                setFilters({ ...filters, ...changedValues });
              }
            }}
          >
            <Form.Item name="q" style={{ width: '35%' }}>
              <Input placeholder="Search episodes" />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Search</Button>
            </Form.Item>
            <Form.Item name="sort" label="Sort" style={{ width: '30%' }}>
              <Select>
                <Option value="desc">Latest</Option>
                <Option value="asc">Old</Option>
              </Select>
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <EpisodeList
        actions={actions}
        data={{ episodes: episodes, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
        fetchEpisodes={fetchEpisodes}
      />
    </Space>
  );
}

export default Episodes;
