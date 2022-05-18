import React from 'react';
import { Popconfirm, Button, Table } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { getSpaces, approveSpaceRequest } from '../../../../actions/spaceRequests';
import { useLocation } from 'react-router-dom';
import deepEqual from 'deep-equal';

function RequestList() {
  const dispatch = useDispatch();
  const query = new URLSearchParams(useLocation().search);
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  query.set('page', filters.page);
  window.history.replaceState({}, '', `${window.PUBLIC_URL}${useLocation().pathname}?${query}`);
  const { spaceRequests, total, loading } = useSelector((state) => {
    const node = state.spaceRequests.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        spaceRequests: node.data.map((element) => state.spaceRequests.details[element]),
        total: node.total,
        loading: state.spaceRequests.loading,
      };
    return { spaceRequests: [], total: 0, loading: state.spaceRequests.loading };
  });

  const orgPermissions = useSelector(({ admin }) => admin);

  let is_admin = !orgPermissions.loading && orgPermissions.organisation.is_admin;

  React.useEffect(() => {
    fetchSpaceRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, is_admin]);

  const fetchSpaceRequests = () => {
    dispatch(getSpaces(filters, is_admin));
  };

  const columns = [
    {
      title: 'Media',
      dataIndex: 'media',
      render: (_, record) => {
        return record.media >= 0 ? <p>{record.media}</p> : <p>Unlimited</p>;
      },
    },
    {
      title: 'Posts',
      dataIndex: 'posts',
      render: (_, record) => {
        return record.posts >= 0 ? <p>{record.posts}</p> : <p>Unlimited</p>;
      },
    },
    {
      title: 'Episodes',
      dataIndex: 'episodes',
      render: (_, record) => {
        return record.episodes >= 0 ? <p>{record.episodes}</p> : <p>Unlimited</p>;
      },
    },
    {
      title: 'Fact Check',
      dataIndex: 'fact_check',
      render: (_, record) => {
        return <p>{record.fact_check ? 'Enabled' : 'Disabled'}</p>;
      },
    },
    {
      title: 'Podcast',
      dataIndex: 'podcast',
      render: (_, record) => {
        return <p>{record.podcast ? 'Enabled' : 'Disabled'}</p>;
      },
    },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  if (is_admin) {
    columns.push({
      title: 'Action',
      dataIndex: 'operation',
      fixed: 'right',
      align: 'center',
      width: 150,
      render: (_, record) => {
        return (
          <span>
            <Popconfirm
              title="Sure to Approve?"
              onConfirm={() =>
                dispatch(approveSpaceRequest(record.id, 'approve')).then(() => fetchSpaceRequests())
              }
            >
              <Button>Approve</Button>
            </Popconfirm>
            <Popconfirm
              title="Sure to Reject?"
              onConfirm={() =>
                dispatch(approveSpaceRequest(record.id, 'reject')).then(() => fetchSpaceRequests())
              }
            >
              <Button>Reject</Button>
            </Popconfirm>
          </span>
        );
      },
    });
  }

  return (
    <Table
      bordered
      columns={columns}
      dataSource={spaceRequests}
      loading={loading}
      rowKey={'id'}
      pagination={{
        total: total,
        current: filters.page,
        pageSize: filters.limit,
        onChange: (pageNumber, pageSize) =>
          setFilters({ ...filters, page: pageNumber, limit: pageSize }),
        pageSizeOptions: ['10', '15', '20'],
      }}
    />
  );
}

export default RequestList;
