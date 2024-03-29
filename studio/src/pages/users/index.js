import React from 'react';
import { Space, Typography, Table, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import { Helmet } from 'react-helmet';
import { getSpaceUsers } from '../../actions/spaces';

function Users() {
  const dispatch = useDispatch();

  const { spaceUsers, loading } = useSelector((state) => {
    const spaceUsers = state.spaces?.details?.[state.spaces?.selected]?.users?.length
      ? state.spaces?.details?.[state.spaces?.selected]?.users
      : [];
    return {
      spaceUsers: spaceUsers,
      loading: state.spaces?.loading,
    };
  });
  React.useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = () => {
    dispatch(getSpaceUsers());
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'display_name',
      key: 'name',
      width: '50%',
      render: (record) => (
        <Typography.Text style={{ fontSize: '1rem' }} strong>
          {record}
        </Typography.Text>
      ),
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
      width: '50%',
      render: (record) => (
        <Typography.Text style={{ fontSize: '1rem' }} strong>
          {record}
        </Typography.Text>
      ),
    },
  ];

  return loading ? (
    <Loader />
  ) : (
    <Space direction={'vertical'}>
      <Helmet title={'Users'} />
      <Table
        columns={columns}
        dataSource={spaceUsers}
        loading={loading}
        rowKey={['record', 'user', 'id']}
      />
    </Space>
  );
}

export default Users;
