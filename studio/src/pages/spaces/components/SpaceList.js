import React from 'react';
import { ConfigProvider, Modal, Button, Table, Typography, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteSpace, getSpaces } from './../../../actions/spaces';
import { spaceSelector } from '../../../selectors/spaces';
import { DeleteOutlined } from '@ant-design/icons';
import useNavigation from '../../../utils/useNavigation';

function SpaceList() {
  const dispatch = useDispatch();
  const { spaces, loading } = useSelector(spaceSelector);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteItemId, setDeleteItemId] = React.useState(null);

  const history = useNavigation();

  const fetchSpaces = () => {
    dispatch(getSpaces());
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 250,
      ellipsis: false,
      render: (_, record) => (
        <Link to={`/admin/spaces/${record.id}/edit`}>
          <Typography.Text
            style={{
              fontSize: '1rem',
              color: '#101828',
              whiteSpace: 'normal',
              wordBreak: 'break-all',
            }}
            strong
          >
            {record.id}
          </Typography.Text>
        </Link>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (_, record) => (
        <Link to={`/admin/spaces/${record.id}/edit`}>
          <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
            {record.name}
          </Typography.Text>
        </Link>
      ),
    },
    {
      title: 'Site Address',
      dataIndex: 'site_address',
      key: 'site_address',
      width: 200,
      ellipsis: true,
      render: (_, record) => (
        <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
          {record.site_address}
        </Typography.Text>
      ),
    },
    {
      title: 'Site Title',
      dataIndex: 'site_title',
      key: 'site_title',
      width: 200,
      ellipsis: true,
      render: (_, record) => (
        <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
          {record.site_title}
        </Typography.Text>
      ),
    },
    {
      title: 'Tag line',
      dataIndex: 'tag_line',
      key: 'tag_line',
      width: 200,
      ellipsis: true,
      render: (_, record) => (
        <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
          {record.tag_line}
        </Typography.Text>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      key: 'operation',
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <Space direction="horizontal">
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  controlHeight: 35,
                  colorBorder: '#F2F2F2',
                  colorPrimaryHover: '#00000026',
                },
              },
            }}
          >
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
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Typography: {
            colorText: '#101828',
          },
          Table: {
            headerBg: '#ffffff',
            headerColor: '#101828',
            borderColor: '#f0f0f0',
            rowHoverBg: '#fafafa',
          },
        },
      }}
    >
      <div style={{ width: '100%', overflow: 'auto' }}>
        <Table
          onRow={(record) => ({
            onClick: () => history(`/admin/spaces/${record.id}/edit`),
            onMouseEnter: () => {
              document.body.style.cursor = 'pointer';
            },
            onMouseLeave: () => {
              document.body.style.cursor = 'default';
            },
          })}
          scroll={{
            x: 1150,
          }}
          rowKey="id"
          dataSource={spaces}
          columns={columns}
          loading={loading}
        />
      </div>

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
          dispatch(deleteSpace(deleteItemId)).then(() => fetchSpaces());
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
        <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
          Are you sure you want to delete this space?
        </Typography.Text>
      </Modal>
    </ConfigProvider>
  );
}

export default SpaceList;
