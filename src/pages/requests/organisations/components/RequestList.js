import React, { useState } from 'react';
import { Popconfirm, Button, Table } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import {
  getOrganisations,
  approveOrganisationRequest,
} from '../../../../actions/organisationRequests';
import { Link } from 'react-router-dom';
import deepEqual from 'deep-equal';

function RequestList() {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });

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
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Spaces',
      dataIndex: ['spaces'],
      render: (_, record) => {
        return record.spaces >= 0 ? <p>{record.spaces}</p> : <p>Unlimited</p>;
      },
    },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  if (is_admin) {
    columns.push({
      title: 'Action',
      dataIndex: 'operation',
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
              <Link to="" className="ant-dropdown-link">
                <Button>Reject</Button>
              </Link>
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
      dataSource={organisationRequests}
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
  );
}

export default RequestList;
