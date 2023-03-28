import React from 'react';
import { Popconfirm, Button, Table, Avatar, Tooltip, Space } from 'antd';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { deleteRole, getRoles } from '../../../actions/roles';

function RoleList({ roles, total, loading }) {
  const dispatch = useDispatch();
  const onDelete = (id) => {
    dispatch(deleteRole(id)).then(() => dispatch(getRoles()));
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
      render: (_, record) => {
        return (
          <div key={record.id}>
            <Link
              key={record.id}
              style={{
                marginRight: 8,
              }}
              to={{
                pathname: `/members/roles/${record.id}/edit`,
              }}
            >
              {record?.name}
            </Link>
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
      title: 'Action',
      dataIndex: 'operation',
      width: '20%',
      render: (_, record) => {
        return (
          <span>
            <Space>
              <Link
                to={{
                  pathname: `/members/roles/${record.id}/users`,
                }}
              >
                <Button icon={<UserOutlined />} primary="true">
                  Users
                </Button>
              </Link>
              <Popconfirm title="Sure to Revoke?" onConfirm={() => onDelete(record.id)}>
                <Button danger icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
            </Space>
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <Table bordered columns={columns} dataSource={roles} rowKey={'id'} loading={loading} />
    </div>
  );
}

export default RoleList;
