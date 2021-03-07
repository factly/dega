import React from 'react';
import { Popconfirm, Button, Table, Space, Form, Select, Input } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { getEpisodes, deleteEpisode } from '../../../actions/episodes';
import { Link } from 'react-router-dom';
import deepEqual from 'deep-equal';

function EpisodeList({ actions }) {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 5,
  });
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

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Season', dataIndex: 'season', key: 'season' },
    { title: 'Episode', dataIndex: 'episode', key: 'episode' },
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
              to={`/episodes/${record.id}/edit`}
            >
              <Button disabled={!(actions.includes('admin') || actions.includes('update'))}>
                Edit
              </Button>
            </Link>
            <Popconfirm
              title="Sure to Delete?"
              onConfirm={() => dispatch(deleteEpisode(record.id)).then(() => fetchEpisodes())}
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
          <Input placeholder="search episodes" />
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
        dataSource={episodes}
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

export default EpisodeList;
