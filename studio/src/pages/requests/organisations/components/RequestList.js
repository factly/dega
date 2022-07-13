import React from 'react';
import { Popconfirm, Button, Table } from 'antd';

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
      fixed: 'right',
      align: 'center',
      width: 150,
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
      bordered
      columns={columns}
      dataSource={organisationRequests}
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
