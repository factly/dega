import React from 'react';
import PodcastList from './components/PodcastList';
import { Space, Button, Form, Row, Col, Input, Select } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPodcasts } from '../../actions/podcasts';
import deepEqual from 'deep-equal';

function Podcasts({ permission }) {
  //const { actions } = permission;
  const actions = ['admin'];
  const dispatch = useDispatch();
  const query = new URLSearchParams(useLocation().search);
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  query.set('page',filters.page);
  window.history.replaceState({}, '', `${window.PUBLIC_URL}${useLocation().pathname}?${query}`);
  const [form] = Form.useForm();
  const { Option } = Select;

  const { podcasts, total, loading } = useSelector((state) => {
    const node = state.podcasts.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        podcasts: node.data.map((element) => state.podcasts.details[element]),
        total: node.total,
        loading: state.podcasts.loading,
      };
    return { podcasts: [], total: 0, loading: state.podcasts.loading };
  });

  React.useEffect(() => {
    fetchPodcasts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchPodcasts = () => {
    dispatch(getPodcasts(filters));
  };
  return (
    <Space direction="vertical">
      <Row>
        <Col span={8}>
          <Link key="1" to="/podcasts/create">
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
              if (!changedValues.q) {
                setFilters({ ...filters, ...changedValues });
              }
            }}
          >
            <Form.Item name="q" style={{ width: '35%' }}>
              <Input placeholder="search podcasts" />
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
      <PodcastList
        actions={actions}
        data={{ podcasts: podcasts, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
        fetchPodcasts={fetchPodcasts}
      />
    </Space>
  );
}

export default Podcasts;
