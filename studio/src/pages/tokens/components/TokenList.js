import React, { useEffect, useState } from 'react';
import { Popconfirm, Button, Table } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { DeleteOutlined } from '@ant-design/icons';
import { deleteSpaceToken, getSpaceTokens } from '../../../actions/tokens';
import deepEqual from 'deep-equal';
import { useLocation, useNavigate } from 'react-router-dom';
import Loader from '../../../components/Loader';

export default function TokenList() {
  const dispatch = useDispatch();
  const query = new URLSearchParams(useLocation().search);
  const pathname = useLocation().pathname;
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });
  const navigate = useNavigate();

  const { tokens, total, loading } = useSelector(({ tokens }) => {
    const node = tokens.req.find((item) => {
      return deepEqual(item.query, { page: query.get('page'), limit: query.get('limit') });
    });

    if (node)
      return {
        tokens: node.data.map((element) => tokens.details[element]),
        total: node.total,
        loading: tokens.loading,
      };
    return { tokens: [], total: 0, loading: tokens.loading };
  });

  useEffect(() => {
    navigate(pathname + '?' + new URLSearchParams(filters).toString());
  }, [filters, pathname, navigate]);

  useEffect(() => {
    fetchTokens();
    // eslint-disable-next-line
  }, [dispatch]);

  const onDelete = (id) => {
    dispatch(deleteSpaceToken(id)).then(() => dispatch(getSpaceTokens(filters)));
  };

  const fetchTokens = () => {
    dispatch(getSpaceTokens(filters));
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '30',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '30%',
      align: 'center',
      render: (_, record) => {
        return (
          <span>
            <Popconfirm title="Sure to Revoke?" onConfirm={() => onDelete(record?.id)}>
              <Button danger icon={<DeleteOutlined />}>
                Revoke
              </Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return loading ? (
    <Loader />
  ) : (
    <Table
      bordered
      loading={loading}
      columns={columns}
      dataSource={tokens}
      rowKey={'id'}
      pagination={{
        total: total,
        current: filters.page,
        pageSize: filters.limit,
        onChange: (pageNumber, pageSize) =>
          setFilters({ ...filters, page: pageNumber, limit: pageSize }),
      }}
    />
  );
}
