import React from 'react';
import { Popconfirm, Button, Table, Typography, Tag } from 'antd';

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
      width: 150,
      onCell: () => {
        return {
          style: {
            minWidth: '150px',
          },
        };
      },
      render: (_, record) => {
        return (
          <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
            {record.media >= 0 ? record.media : 'Unlimited'}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Posts',
      dataIndex: 'posts',
      width: 150,
      onCell: () => {
        return {
          style: {
            minWidth: '150px',
          },
        };
      },
      render: (_, record) => {
        return (
          <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
            {record.posts >= 0 ? record.posts : 'Unlimited'}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Episodes',
      dataIndex: 'episodes',
      width: 150,
      onCell: () => {
        return {
          style: {
            minWidth: '150px',
          },
        };
      },
      render: (_, record) => {
        return (
          <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
            {record.posts >= 0 ? record.episodes : 'Unlimited'}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Fact Check',
      dataIndex: 'fact_check',
      width: 150,
      onCell: () => {
        return {
          style: {
            minWidth: '150px',
          },
        };
      },
      render: (_, record) => {
        return (
          <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
            {record.fact_check ? 'Enabled' : 'Disabled'}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Podcast',
      dataIndex: 'podcast',
      width: 150,
      onCell: () => {
        return {
          style: {
            minWidth: '150px',
          },
        };
      },
      render: (_, record) => {
        return (
          <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
            {record.podcast ? 'Enabled' : 'Disabled'}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      onCell: () => {
        return {
          style: {
            minWidth: '150px',
          },
        };
      },
      render: (_, item) => {
        switch (item.status) {
          case 'pending':
            return <Tag color="orange">Pending</Tag>;
          case 'approved':
            return <Tag color="green">Approved</Tag>;
          case 'rejected':
            return <Tag color="red">Rejected</Tag>;
          case 'closed':
            return <Tag color="red">Closed</Tag>;
          default:
            return <Tag color="orange">Pending</Tag>;
        }
      },
    },
  ];

  if (is_admin) {
    columns.push({
      title: 'Action',
      dataIndex: 'operation',
      align: 'center',
      width: 150,
      onCell: () => {
        return {
          style: {
            minWidth: '150px',
          },
        };
      },
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
      // style={{ maxWidth: '100vw', overflowX: 'auto' }}
      scroll={{
        x: '1000',
      }}
      columns={columns}
      dataSource={spaceRequests}
      loading={loading}
      rowKey={'id'}
      pagination={{
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
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
