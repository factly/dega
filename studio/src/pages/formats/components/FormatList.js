import React from 'react';
import { Popconfirm, Button, Typography, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getFormats, deleteFormat } from '../../../actions/formats';
import { Link, useLocation } from 'react-router-dom';
import deepEqual from 'deep-equal';
import { DeleteOutlined } from '@ant-design/icons';

function FormatList({ actions }) {
  const dispatch = useDispatch();
  const query = new URLSearchParams(useLocation().search);
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  query.set('page', filters.page);
  window.history.replaceState({}, '', `${window.PUBLIC_URL}${useLocation().pathname}?${query}`);
  const { formats, total, loading } = useSelector((state) => {
    const node = state.formats.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        formats: node.data.map((element) => state.formats.details[element]),
        total: node.total,
        loading: state.formats.loading,
      };
    return { formats: [], total: 0, loading: state.formats.loading };
  });

  React.useEffect(() => {
    fetchFormats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchFormats = () => {
    dispatch(getFormats(filters));
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => {
        return (
          <Link
            className="ant-dropdown-link"
            style={{
              marginRight: 8,
            }}
            to={`/formats/${record.id}/edit`}
          >
            {record.name}
          </Link>
        );
      },
    },
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
      fixed: 'right',
      align: 'center',
      width: 150,
      render: (_, record) => {
        return (
          <Popconfirm
            title="Are you sure you want to delete this?"
            onConfirm={() => dispatch(deleteFormat(record.id)).then(() => fetchFormats())}
          >
            <Link to="" className="ant-dropdown-link">
              <Button
                icon={<DeleteOutlined />}
                disabled={!(actions.includes('admin') || actions.includes('delete'))}
                type="danger"
              />
            </Link>
          </Popconfirm>
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
        current: filters.page,
        pageSize: filters.limit,
        onChange: (pageNumber, pageSize) => setFilters({ page: pageNumber, limit: pageSize }),
      }}
    />
  );
}

export default FormatList;
