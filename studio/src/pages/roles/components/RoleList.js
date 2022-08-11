import React from 'react';
import { Popconfirm, Button, Table, Avatar, Tooltip, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
//import { deleteSpaceRole, getSpaceRoles } from '../../../../../../../actions/roles';
import { Link } from 'react-router-dom';
import { UserAddOutlined, DeleteOutlined } from '@ant-design/icons';

function RoleList({ roles, total, loading }) {
  //   const dispatch = useDispatch();
  //   const { roles, loading } = useSelector((state) => {
  //     var roleIDs = [];
  //     roleIDs = state.spaces.details[spaceID]?.roleIDs || [];
  //     return {
  //       roles: roleIDs.map((id) => ({
  //         ...state.roles.space[spaceID][id],
  //         users:
  //           state.roles.space[spaceID][id]?.users.map((userID) => state.users.details[userID]) || [],
  //       })),
  //       loading: state.roles.loading,
  //     };
  //   });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
      render: (_, record) => {
        return (
          <div key={record.id}>
            {/* {role === 'owner' ? ( */}
            <Link
              key={record.id}
              style={{
                marginRight: 8,
              }}
              to={{
                pathname: ``,
              }}
            >
              {record?.name}
            </Link>
            {/* ) : (
              <h4 key={record.id}>{record?.name}</h4>
            ) */}
          </div>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '15%',
    },
    {
      title: 'Users',
      dataIndex: 'users',
      key: 'users',
      width: '15%',
      render: (_, record) => {
        return (
          <Avatar.Group
            maxCount={3}
            maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}
            key={record.id}
          >
            {record?.users?.map((user) => {
              return (
                <Tooltip title={user?.email} placement="top" key={'role-' + user?.id}>
                  <Avatar
                    key={user?.id}
                    style={{
                      backgroundColor:
                        '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0'),
                    }}
                  >
                    {user?.email?.charAt(0)}
                  </Avatar>
                </Tooltip>
              );
            })}
          </Avatar.Group>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '20%',
      render: (_, record) => {
        return (
          <span>
            {/* {role === 'owner' ? ( */}
              <Space>
                <Link
                  to={{
                    pathname: ``,
                  }}
                >
                  <Button icon={<UserAddOutlined />} primary="true">
                    Add users
                  </Button>
                </Link>
                <Popconfirm title="Sure to Revoke?" onConfirm={() => onDelete(record.id)}>
                  <Button type="danger" icon={<DeleteOutlined />}>
                    {' '}
                    Delete{' '}
                  </Button>
                </Popconfirm>
              </Space>
            {/* ) */}
            {/* // : null} */}
          </span>
        );
      },
    },
  ];

  //   const fetchRoles = () => {
  //     dispatch(getSpaceRoles(appID, spaceID));
  //   };

  //   const onDelete = (id) => {
  //     dispatch(deleteSpaceRole(appID, spaceID, id)).then(() =>
  //       dispatch(getSpaceRoles(appID, spaceID)),
  //     );
  //   };

  //   React.useEffect(() => {
  //     fetchRoles();
  //     // eslint-disable-next-line
  //   }, [dispatch, appID, spaceID]);

  return (
    <div>
      <Table
        bordered
        columns={columns}
        dataSource={roles}
        rowKey={'id'}
        loading={loading}
        //  style={{ width: '78vw' }}
      />
    </div>
  );
}

export default RoleList;
