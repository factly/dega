import React from 'react';
import { Popconfirm, Avatar, Button, Table, Space, Form, Input, Select, Tooltip } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getMedia, deleteMedium } from '../../../actions/media';
import { Link } from 'react-router-dom';
import deepEqual from 'deep-equal';

function MediumList({ actions }) {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 5,
  });
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

  const columns = [
    {
      title: 'Display',
      key: 'display',
      render: (_, record) => (
        <Avatar
          shape="square"
          style={{ width: '100%', height: '100%' }}
          src={record.url?.proxy ? `${record.url.proxy}?resize:fill:200:150/gravity:sm` : ''}
        />
      ),
      width: '15%',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: {
        showTitle: false,
      },
      render: name => (
        <Tooltip placement="topLeft" title={name}>
          {name}
        </Tooltip>
      ),
    },
    {
      title: 'File size',
      dataIndex: 'file_size',
      key: 'file_size',
      render: (_, record) => Math.round((parseInt(record.file_size) / 1024) * 100) / 100 + ' KB',
    },
    {
      title: 'Caption',
      dataIndex: 'caption',
      key: 'caption',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Action',
      key: 'operation',
      width: '15%',
      render: (_, record) => {
        return (
          <span>
            <Link
              style={{
                marginRight: 8,
              }}
              to={`/media/${record.id}/edit`}
            >
              <Button disabled={!(actions.includes('admin') || actions.includes('update'))}>
                Edit
              </Button>
            </Link>
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={() => dispatch(deleteMedium(record.id)).then(() => fetchMedia())}
            >
              <Button disabled={!(actions.includes('admin') || actions.includes('delete'))}>
                Delete
              </Button>
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
        onFinish={(values) =>
          setFilters({
            ...filters,
            ...values,
          })
        }
        style={{ maxWidth: '100%' }}
      >
        <Form.Item name="q" label="Search" style={{ width: '25%' }}>
          <Input placeholder="search media" />
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
        dataSource={media}
        columns={columns}
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

export default MediumList;
