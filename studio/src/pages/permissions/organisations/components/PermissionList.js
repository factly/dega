import React from 'react';
import { Popconfirm, Button, Table } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { getOrganisations, deleteOrganisationPermission } from '../../../../actions/organisations';
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
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => {
        return !admin ? (
          <p> {record.title}</p>
        ) : (
          <Link
            className="ant-dropdown-link"
            style={{
              marginRight: 8,
            }}
            to={`/admin/organisations/${record.id}/permissions/${record.permission.id}/edit`}
          >
            {record.title}
          </Link>
        );
      },
    },
    {
      title: 'Spaces',
      dataIndex: ['permission', 'spaces'],
      render: (_, record) => {
        return record.permission.spaces >= 0 ? <p>{record.permission.spaces}</p> : <p>Unlimited</p>;
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
              dispatch(deleteOrganisationPermission(record.permission.id)).then(() =>
                fetchOrganisationPermissions(),
              )
            }
          >
            <Link to="" className="ant-dropdown-link">
              <Button disabled={!admin} type="danger" icon={<DeleteOutlined />} />
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
