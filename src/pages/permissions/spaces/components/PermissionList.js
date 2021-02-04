import React from 'react';
import { Popconfirm, Button, Table } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { getSpaces, deleteSpacePermission } from '../../../../actions/spacePermissions';
import { Link } from 'react-router-dom';

function PermissionList() {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 5,
  });

  const { space_permissions, total, loading } = useSelector((state) => {
    const req = state.spacePermissions.req;

    if (req.length > 0 && req[0].total > 0) {
      const details = Object.keys(state.spacePermissions.details)
        .map((key, index) => {
          return state.spacePermissions.details[key].permission
            ? state.spacePermissions.details[key]
            : undefined;
        })
        .filter((each) => each);
      return {
        space_permissions: details.slice(
          filters.page - 1,
          filters.limit + (filters.page - 1) * filters.limit,
        ),
        total: details.total,
        loading: state.spacePermissions.loading,
      };
    }

    return {
      space_permissions: [],
      total: 0,
      loading: state.spacePermissions.loading,
    };
  });

  React.useEffect(() => {
    fetchSpacePermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchSpacePermissions = () => {
    dispatch(getSpaces(filters));
  };

  const columns = [
    { title: 'Space', dataIndex: 'name', key: 'name' },
    {
      title: 'Organisation ID',
      dataIndex: 'organisation_id',
      key: 'organisation_id',
      width: '10%',
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
      width: '20%',
      render: (_, record) => {
        return (
          <span>
            <Link
              className="ant-dropdown-link"
              style={{
                marginRight: 8,
              }}
              to={`/permissions/${record.id}/spaces/${record.permission.id}/edit`}
            >
              <Button>Edit</Button>
            </Link>
            <Popconfirm
              title="Sure to Delete?"
              onConfirm={() =>
                dispatch(deleteSpacePermission(record.permission.id)).then(() =>
                  fetchSpacePermissions(),
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
      dataSource={space_permissions}
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
