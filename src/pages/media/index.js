import React from 'react';
import { Space, Button, Row, Col, Form, Input, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import MediumList from './components/MediumList';
import { getMedia } from '../../actions/media';
import { Link, useLocation } from 'react-router-dom';
import deepEqual from 'deep-equal';

function Media({ permission }) {
  const { actions } = permission;
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

  const { media, total, loading } = useSelector((state) => {
    const node = state.media.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        media: node.data.map((element) => state.media.details[element]),
        total: node.total,
        loading: state.media.loading,
      };
    return { media: [], total: 0, loading: state.media.loading };
  });

  React.useEffect(() => {
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchMedia = () => {
    dispatch(getMedia(filters));
  };

  return (
    <Space direction="vertical">
      <Row>
        <Col span={8}>
          <Link to="/media/upload">
            <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
              Upload
            </Button>
          </Link>
        </Col>
        <Col span={8} offset={8}>
          <Form
            initialValues={filters}
            form={form}
            name="filters"
            layout="inline"
            onFinish={(values) =>
              setFilters({
                ...filters,
                ...values,
              })
            }
            style={{ width: '100%', marginBottom: '1rem' }}
            onValuesChange={(changedValues, allValues) => {
              let changedKey = Object.keys(changedValues)[0];
              query.set(changedKey, changedValues[changedKey]);
              if (!changedValues.q) {
                setFilters({ ...filters, ...changedValues });
              }
            }}
          >
            <Form.Item name="q">
              <Input placeholder="Search media" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Search
              </Button>
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
      <MediumList
        actions={actions}
        data={{ media: media, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
        fetchMedia={fetchMedia}
      />
    </Space>
  );
}

export default Media;
