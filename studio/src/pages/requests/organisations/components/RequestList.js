import React from 'react';
import { Popconfirm, Button, Table, Tag, Typography } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import {
  getOrganisations,
  approveOrganisationRequest,
} from '../../../../actions/organisationRequests';
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
  const { organisationRequests, total, loading } = useSelector((state) => {
    const node = state.organisationRequests.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        organisationRequests: node.data.map(
          (element) => state.organisationRequests.details[element],
        ),
        total: node.total,
        loading: state.organisationRequests.loading,
      };
    return { organisationRequests: [], total: 0, loading: state.organisationRequests.loading };
  });

  const orgPermissions = useSelector(({ admin }) => admin);

  let is_admin = !orgPermissions.loading && orgPermissions.organisation.is_admin;

  React.useEffect(() => {
    fetchOrganisationRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, is_admin]);

  const fetchOrganisationRequests = () => {
    dispatch(getOrganisations(filters, is_admin));
  };

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      onCell: () => {
        return {
          style: {
            minWidth: '400px',
          },
        };
      },
      width: 400,
      render: (_, item) => (
        <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
          {item.description}
        </Typography.Text>
      ),
    },
    {
      title: 'Spaces',
      dataIndex: ['spaces'],
      width: 150,
      onCell: () => {
        return {
          style: {
            minWidth: '150px',
          },
        };
      },
      render: (_, item) => (
        <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
          {item.spaces >= 0 ? item.spaces : 'Unlimited'}
        </Typography.Text>
      ),
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
                dispatch(approveOrganisationRequest(record.id, 'approve')).then(() =>
                  fetchOrganisationRequests(),
                )
              }
            >
              <Button>Approve</Button>
            </Popconfirm>
            <Popconfirm
              title="Sure to Reject?"
              onConfirm={() =>
                dispatch(approveOrganisationRequest(record.id, 'reject')).then(() =>
                  fetchOrganisationRequests(),
                )
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
      columns={columns}
      dataSource={organisationRequests}
      scroll={{
        x: '1000',
      }}
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
