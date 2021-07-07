/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import TagList from './components/TagList';
import { Space, Button, Form, Select, Row, Col, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getTags } from '../../actions/tags';
import { Link, useHistory, useLocation } from 'react-router-dom';
import deepEqual from 'deep-equal';

function Tags({ permission }) {
  const { actions } = permission;
  const history = useHistory();
  const dispatch = useDispatch();
  const query = new URLSearchParams(useLocation().search);

  const params = {};
  const keys = ['page', 'limit', 'q', 'sort'];
  keys.forEach((key) => {
    if (query.get(key)) params[key] = query.get(key);
  });
  const [filters, setFilters] = React.useState({
    ...params,
  });

  const pathName = useLocation().pathname;

  useEffect(() => {
    history.push({
      pathname: pathName,
      search: new URLSearchParams(filters).toString(),
    });
  }, [history, filters]);

  const [form] = Form.useForm();
  const { Option } = Select;

  const { tags, total, loading } = useSelector((state) => {
    const node = state.tags.req.find((item) => {
      return deepEqual(item.query, params);
    });

    if (node)
      return {
        tags: node.data.map((element) => state.tags.details[element]),
        total: node.total,
        loading: state.tags.loading,
      };
    return { tags: [], total: 0, loading: state.tags.loading };
  });

  React.useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchTags = () => {
    dispatch(getTags(filters));
  };
  return (
    <Space direction="vertical">
      <Row>
        <Col span={8}>
          <Link key="1" to="/tags/create">
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
            onFinish={(values) =>
              setFilters({
                ...filters,
                ...values,
              })
            }
            style={{ width: '100%' }}
            onValuesChange={(changedValues, allValues) => {
              let changedKey = Object.keys(changedValues)[0];
              query.set(changedKey, changedValues[changedKey]);
              if (!changedValues.q) {
                setFilters({ ...filters, ...changedValues });
              }
            }}
          >
            <Form.Item name="q">
              <Input placeholder="Search tags" />
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
      <TagList
        actions={actions}
        data={{ tags: tags, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
        fetchTags={fetchTags}
      />
    </Space>
  );
}

export default Tags;
