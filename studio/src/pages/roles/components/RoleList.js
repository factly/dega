import React from 'react';
import { Button, Table, ConfigProvider, Typography, Modal } from 'antd';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { deleteRole, getRoles } from '../../../actions/roles';
import useNavigation from '../../../utils/useNavigation';

function RoleList({ roles, total, loading }) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteItemId, setDeleteItemId] = React.useState(null);
  const dispatch = useDispatch();

  const history = useNavigation();
  const onDelete = (id) => {
    dispatch(deleteRole(id)).then(() => dispatch(getRoles()));
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      onCell: () => {
        return {
          style: {
            minWidth: '200px',
          },
        };
      },
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
              <Typography.Text style={{ fontSize: '1rem' }} strong>
                {record.name}
              </Typography.Text>
            </Link>
          </div>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 400,
      onCell: () => {
        return {
          style: {
            minWidth: '400px',
          },
        };
      },
      render: (_, record) => (
        <Typography.Paragraph style={{ fontSize: '1rem' }} strong ellipsis={{ rows: 2 }}>
          {record.description}
        </Typography.Paragraph>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: 200,
      onCell: () => {
        return {
          style: {
            minWidth: '200px',
          },
        };
      },
      render: (_, record) => {
        return (
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  controlHeight: 35,
                  colorBorder: '#F2F2F2',
                  colorPrimaryHover: '#00000026',
                },
                Modal: {
                  colorBgMask: '#0000000B',
                },
              },
            }}
          >
            <Link
              to={{
                pathname: `/settings/members/roles/${record.id}/users`,
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Button
                size="large"
                style={{ marginRight: '8px' }}
                icon={<UserOutlined style={{ color: '#858585' }} />}
              />
            </Link>
            <Button
              size="large"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
                setDeleteItemId(record.id);
              }}
              icon={<DeleteOutlined style={{ color: '#858585' }} />}
            />
          </ConfigProvider>
        );
      },
    },
  ];

  return (
    <div>
      <ConfigProvider
        theme={{
          components: {
            Typography: {
              colorText: '#101828',
            },
          },
        }}
      >
        <Table
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                history(`/settings/members/roles/${record.id}/edit`);
              },
              onMouseEnter: (event) => {
                document.body.style.cursor = 'pointer';
              },
              onMouseLeave: (event) => {
                document.body.style.cursor = 'default';
              },
            };
          }}
          scroll={{
            x: '1000',
          }}
          columns={columns}
          dataSource={roles}
          rowKey={'id'}
          loading={loading}
        />
        <Modal
          open={modalOpen}
          closable={false}
          centered
          width={311}
          className="delete-modal-container"
          style={{
            borderRadius: '18px',
          }}
          onOk={(e) => {
            e.stopPropagation();
            onDelete(deleteItemId);
            setModalOpen(false);
            setDeleteItemId(null);
          }}
          cancelButtonProps={{ type: 'text', style: { color: '#000' } }}
          onCancel={(e) => {
            e.stopPropagation();
            setModalOpen(false);
            setDeleteItemId(null);
          }}
        >
          <Typography.Text strong>Are you sure you want to delete this ?</Typography.Text>
        </Modal>
      </ConfigProvider>
    </div>
  );
}

export default RoleList;
