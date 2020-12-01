import React from 'react';
import { Popconfirm, Button, Table } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { getOrganisations, deleteOrganisationPermission } from '../../../actions/organisations';
import { Link } from 'react-router-dom';
function PermissionList() {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 5,
  });

  const { organisation_permissions, total, loading } = useSelector((state) => {
    const req = state.organisations.req;

    if (req.length > 0 && req[0].total > 0) {
      const details = Object.keys(state.organisations.details)
        .map((key, index) => {
          return state.organisations.details[key].permission
            ? state.organisations.details[key]
            : undefined;
        })
        .filter((each) => each);
      return {
        organisation_permissions: details.slice(
          filters.page - 1,
          filters.limit + (filters.page - 1) * filters.limit,
        ),
        total: details.total,
        loading: state.organisations.loading,
      };
    }

    return {
      organisation_permissions: [],
      total: 0,
      loading: state.organisations.loading,
    };
  });

  React.useEffect(() => {
    fetchOrganisationPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchOrganisationPermissions = () => {
    dispatch(getOrganisations(filters));
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Spaces',
      dataIndex: ['permission', 'spaces'],
      render: (_, record) => {
        return record.permission.media > 0 ? (
          <p>{record.permission.spaces ? record.permission.spaces : 0}</p>
        ) : (
          <p>Unlimited</p>
        );
      },
    },
    {
      title: 'Media',
      dataIndex: ['permission', 'media'],
      render: (_, record) => {
        return record.permission.media > 0 ? (
          <p>{record.permission.media ? record.permission.media : 0}</p>
        ) : (
          <p>Unlimited</p>
        );
      },
    },
    {
      title: 'Posts',
      dataIndex: ['permission', 'posts'],
      render: (_, record) => {
        return record.permission.posts > 0 ? (
          <p>{record.permission.posts ? record.permission.posts : 0}</p>
        ) : (
          <p>Unlimited</p>
        );
      },
    },
    {
      title: 'Fact Check',
      dataIndex: ['permission', 'fact_check'],
      render: (_, record) => {
        return <p>{record.permission.fact_check ? 'Enabled' : 'Disabled'}</p>;
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
              to={`/organisations/${record.id}/permissions/${record.permission.id}/edit`}
            >
              <Button>Edit</Button>
            </Link>
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={() =>
                dispatch(deleteOrganisationPermission(record.permission.id)).then(() =>
                  fetchOrganisationPermissions(),
                )
              }
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
      dataSource={organisation_permissions}
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

export default PermissionList;
