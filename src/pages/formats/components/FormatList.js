import React from 'react';
import { Popconfirm, Button, Typography, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getFormats, deleteFormat } from '../../../actions/formats';
import { Link } from 'react-router-dom';
import { entitySelector } from '../../../selectors';

function FormatList() {
  const dispatch = useDispatch();
  const [page, setPage] = React.useState(1);

  const { formats, total, loading } = useSelector((state) =>
    entitySelector(state, page, 'formats'),
  );

  React.useEffect(() => {
    fetchFormats();
  }, [page]);

  const fetchFormats = () => {
    dispatch(getFormats({ page: page }));
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
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
              to={`/formats/${record.id}/edit`}
            >
              <Button>Edit</Button>
            </Link>
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={() => dispatch(deleteFormat(record.id)).then(() => fetchFormats())}
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
    <Table
      bordered
      columns={columns}
      dataSource={formats}
      loading={loading}
      rowKey={'id'}
      pagination={{
        total: total,
        current: page,
        pageSize: 5,
        onChange: (pageNumber, pageSize) => setPage(pageNumber),
      }}
    />
  );
}

export default FormatList;
