import React from 'react';
import { Popconfirm, Button, Typography, Table, Space, Form, Select, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getTags, deleteTag } from '../../../actions/tags';
import { Link } from 'react-router-dom';
import deepEqual from 'deep-equal';

function TagList() {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 5,
  });
  const [form] = Form.useForm();
  const { Option } = Select;

  const { tags, total, loading } = useSelector((state) => {
    const node = state.tags.req.find((item) => {
      return deepEqual(item.query, filters);
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
  }, [filters]);

  const fetchTags = () => {
    dispatch(getTags(filters));
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: '15%' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', width: '15%' },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '50%',
      render: (_, record) => {
        return (
          <Typography.Paragraph ellipsis={{ rows: 2 }}>{record.description}</Typography.Paragraph>
        );
      },
    },
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
              to={`/tags/${record.id}/edit`}
            >
              <Button>Edit</Button>
            </Link>
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={() => dispatch(deleteTag(record.id)).then(() => fetchTags())}
            >
              <Link to="" className="ant-dropdown-link">
                <Button>Delete</Button>
              </Link>
            </Popconfirm>
          </span>
        );
      },
      width: '20%',
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
            sort_by: values.sort,
            q: values.q,
          })
        }
        style={{ maxWidth: '100%' }}
      >
        <Form.Item name="q" label="Search" style={{ width: '25%' }}>
          <Input placeholder="search tags" />
        </Form.Item>
        <Form.Item name="sort" label="sort" style={{ width: '15%' }}>
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
        dataSource={tags}
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

export default TagList;
