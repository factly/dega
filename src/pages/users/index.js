import React from 'react';
import { Space, Typography, Table, Tag } from 'antd';
import { getUsers } from '../../actions/users';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Avatar from 'antd/lib/avatar/avatar';

function Users() {
  const dispatch = useDispatch();

  const { details, loading } = useSelector((state) => state.users);

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    dispatch(getUsers());
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => {
        return (
          <Typography key={record.id}>
            <Link to={`/users/${record.id}/permissions`}>
              {record.first_name + ' ' + record.last_name}
            </Link>
          </Typography>
        );
      },
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Policies',
      dataIndex: 'policies',
      key: 'policies',
      render: (_, record) => {
        return record.policies.map((policy, index) => (
          <Tag key={record.id + policy.id}>
            {policy.id != 'admin' ? (
              <Link to={`/policies/${policy.id}/edit`}> {policy.name}</Link>
            ) : (
              policy.name
            )}
          </Tag>
        ));
      },
    },
  ];

  return (
    <Space direction={'vertical'}>
      <Table
        bordered
        columns={columns}
        dataSource={details}
        loading={loading}
        rowKey={['record', 'user', 'id']}
      />
    </Space>
  );
}

export default Users;
