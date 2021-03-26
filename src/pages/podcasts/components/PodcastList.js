import React from 'react';
import { Popconfirm, Button, Table, Space, Form, Select, Input } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { getPodcasts, deletePodcast } from '../../../actions/podcasts';
import { Link } from 'react-router-dom';
import deepEqual from 'deep-equal';

function PodcastList({ actions }) {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
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

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Season', dataIndex: 'season', key: 'season' },
    { title: 'Podcast', dataIndex: 'podcast', key: 'podcast' },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_, record) => {
        return (
          <span>
            <Link
              className="ant-dropdown-link"
              style={{
                marginRight: 8,
              }}
              to={`/podcasts/${record.id}/edit`}
            >
              <Button disabled={!(actions.includes('admin') || actions.includes('update'))}>
                Edit
              </Button>
            </Link>
            <Popconfirm
              title="Sure to Delete?"
              onConfirm={() => dispatch(deletePodcast(record.id)).then(() => fetchPodcasts())}
            >
              <Link to="" className="ant-dropdown-link">
                <Button disabled={!(actions.includes('admin') || actions.includes('delete'))}>
                  Delete
                </Button>
              </Link>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return (
    <Space direction={'vertical'}>
      <Form
        initialValues={filters}
        form={form}
        name="filters"
        layout="inline"
        onFinish={(values) => setFilters({ ...filters, ...values })}
        style={{ maxWidth: '100%' }}
      >
        <Form.Item name="q" label="Search" style={{ width: '25%' }}>
          <Input placeholder="search podcasts" />
        </Form.Item>
        <Form.Item name="sort" label="Sort" style={{ width: '15%' }}>
          <Select>
            <Option value="desc">Latest</Option>
            <Option value="asc">Old</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      <Table
        bordered
        columns={columns}
        dataSource={podcasts}
        loading={loading}
        rowKey={'id'}
        pagination={{
          total: total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) =>
            setFilters({ ...filters, page: pageNumber, limit: pageSize }),
        }}
      />
    </Space>
  );
}

export default PodcastList;
