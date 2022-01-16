import React from 'react';
import { Space, Typography, Table, Tag } from 'antd';
import { getUsers } from '../../actions/users';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';

function Users() {
  const dispatch = useDispatch();

  const { details, loading } = useSelector((state) => state.users);

  React.useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            {record.policies[0].id !== 'admin' ? (
              <Link to={`/members/users/${record.id}/permissions`}>
                {record.first_name + ' ' + record.last_name}
              </Link>
            ) : (
              record.first_name + ' ' + record.last_name
            )}
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
            {policy.id !== 'admin' ? (
              <Link to={`/members/policies/${policy.id}/edit`}> {policy.name}</Link>
            ) : (
              policy.name
            )}
          </Tag>
        ));
      },
    },
  ];

  return loading ? (
    <Loader />
  ) : (
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
