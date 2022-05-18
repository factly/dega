import React from 'react';
import { Popconfirm, Button, Table } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { getSpaces, deleteSpacePermission } from '../../../../actions/spacePermissions';
import { Link, useLocation } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function PermissionList({ admin }) {
  const dispatch = useDispatch();
  const query = new URLSearchParams(useLocation().search);
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  query.set('page', filters.page);
  window.history.replaceState({}, '', `${window.PUBLIC_URL}${useLocation().pathname}?${query}`);
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
    {
      title: 'Space',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => {
        return !admin ? (
          <p>{record.name}</p>
        ) : (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/admin/spaces/${record.id}/permissions/${record.permission.id}/edit`}
          >
            {record.name}
          </Link>
        );
      },
    },
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
        return record.permission.media >= 0 ? <p>{record.permission.media}</p> : <p>Unlimited</p>;
      },
    },
    {
      title: 'Posts',
      dataIndex: ['permission', 'posts'],
      render: (_, record) => {
        return record.permission.posts >= 0 ? <p>{record.permission.posts} </p> : <p>Unlimited</p>;
      },
    },
    {
      title: 'Episodes',
      dataIndex: ['permission', 'episodes'],
      render: (_, record) => {
        return record.permission.episodes >= 0 ? (
          <p>{record.permission.episodes}</p>
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
      title: 'Podcast',
      dataIndex: ['permission', 'podcast'],
      render: (_, record) => {
        return <p>{record.permission.podcast ? 'Enabled' : 'Disabled'}</p>;
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
            onConfirm={() =>
              dispatch(deleteSpacePermission(record.permission.id)).then(() =>
                fetchSpacePermissions(),
              )
            }
          >
            <Button disabled={!admin} type="danger" icon={<DeleteOutlined />} />
          </Popconfirm>
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
        pageSizeOptions: ['10', '15', '20'],
      }}
    />
  );
}

export default PermissionList;
