import React from 'react';
import { Popconfirm, Button, Typography, Table, Space, Form, Select, Input } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { getClaimants, deleteClaimant } from '../../../actions/claimants';
import { Link } from 'react-router-dom';
import deepEqual from 'deep-equal';

function ClaimantList() {
  const dispatch = useDispatch();
  const [page, setPage] = React.useState(1);
  const [filters, setFilters] = React.useState();
  const [form] = Form.useForm();
  const { Option } = Select;

  const { claimants, total, loading } = useSelector((state) => {
    let query = {
      page,
      ...filters,
    };

    const node = state.claimants.req.find((item) => {
      return deepEqual(item.query, query);
    });

    if (node)
      return {
        claimants: node.data.map((element) => state.claimants.details[element]),
        total: node.total,
        loading: state.claimants.loading,
      };
    return { claimants: [], total: 0, loading: state.claimants.loading };
  });

  React.useEffect(() => {
    fetchClaimants();
  }, [page, filters]);

  const fetchClaimants = () => {
    dispatch(getClaimants({ page: page, ...filters }));
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    {
      title: 'Tag Line',
      dataIndex: 'tag_line',
      key: 'tag_line',
      width: '20%',
      render: (_, record) => {
        return (
          <Typography.Paragraph ellipsis={{ rows: 2 }}>{record.tag_line}</Typography.Paragraph>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '30%',
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
              to={`/claimants/${record.id}/edit`}
            >
              <Button>Edit</Button>
            </Link>
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={() => dispatch(deleteClaimant(record.id)).then(() => fetchClaimants())}
            >
              <Link to="" className="ant-dropdown-link">
                <Button>Delete</Button>
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
        onFinish={(values) =>
          setFilters({
            sort_by: values.sort,
            q: values.q,
          })
        }
        style={{ maxWidth: '100%' }}
      >
        <Form.Item name="q" label="Query" style={{ width: '25%' }}>
          <Input placeholder="search post" />
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
        dataSource={claimants}
        loading={loading}
        rowKey={'id'}
        pagination={{
          total: total,
          current: page,
          pageSize: 5,
          onChange: (pageNumber, pageSize) => setPage(pageNumber),
        }}
      />
    </Space>
  );
}

export default ClaimantList;
