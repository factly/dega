import React from 'react';
import { Popconfirm, Button, Typography, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getTags, deleteTag } from '../../../actions/tags';
import { Link } from 'react-router-dom';

function TagsList() {
  const dispatch = useDispatch();
  const [page, setPage] = React.useState(1);

  const { tags, total, loading } = useSelector((state) => {
    const node = state.tags.req.find((item) => {
      return item.query.page === page;
    });

    if (node)
      return {
        tags: node.ids.map((element) => state.tags.details[element]),
        total: state.tags.total,
        loading: state.tags.loading,
      };
    return { tags: [], total: 0, loading: state.tags.loading };
  });

  React.useEffect(() => {
    fetchTags();
  }, [page]);

  const fetchTags = () => {
    dispatch(getTags({ page: page }));
  };

  const onConfirm = (id) => dispatch(deleteTag(id));

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
            <Popconfirm title="Sure to cancel?" onConfirm={() => onConfirm(record.id)}>
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
    <Table
      bordered
      columns={columns}
      dataSource={tags}
      loading={loading}
      pagination={{
        total: total,
        current: page,
        pageSize: 5,
        onChange: (page, pageSize) => setPage(page),
      }}
    />
  );
}

export default TagsList;
