import React from 'react';
import { Button, Table, Space, ConfigProvider, Typography, Modal } from 'antd';
import { useDispatch } from 'react-redux';
import { deleteTag } from '../../../actions/tags';
import { Link, useHistory } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function TagList({ actions, filters, setFilters, fetchTags, data }) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteItemID, setDeleteItemID] = React.useState(null);

  const dispatch = useDispatch();

  const history = useHistory();
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 400,
      key: 'name',
      onCell: () => {
        return {
          style: {
            minWidth: '200px',
          },
        };
      },
      render: (_, record) => {
        return (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/tags/${record.id}/edit`}
          >
            <Typography.Text style={{ fontSize: '1rem' }} strong>
              {record.name}
            </Typography.Text>
          </Link>
        );
      },
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      width: 400,
      key: 'slug',
      onCell: () => {
        return {
          style: {
            minWidth: '200px',
          },
        };
      },
      render: (_, record) => {
        return (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/tags/${record.id}/edit`}
          >
            <Typography.Text style={{ fontSize: '1rem' }} strong>
              {record.slug}
            </Typography.Text>
          </Link>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      fixed: 'right',
      align: 'center',
      width: 150,
      onCell: () => {
        return {
          style: {
            minWidth: '150px',
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
              },
            }}
          >
            <Button
              size="large"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
                setDeleteItemID(record.id);
              }}
              icon={<DeleteOutlined style={{ color: '#858585' }} />}
              disabled={!(actions.includes('admin') || actions.includes('delete'))}
            />
          </ConfigProvider>
        );
      },
    },
  ];

  return (
    <Space direction={'vertical'}>
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
          columns={columns}
          dataSource={data.tags}
          loading={data.loading}
          rowKey={'id'}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                history.push(`/tags/${record.id}/edit`);
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
          pagination={{
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
            total: data.total,
            current: filters.page,
            pageSize: filters.limit,
            onChange: (pageNumber, pageSize) =>
              setFilters({ ...filters, page: pageNumber, limit: pageSize }),
            pageSizeOptions: ['10', '15', '20'],
          }}
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
            dispatch(deleteTag(deleteItemID)).then(() => fetchTags());
            setModalOpen(false);
            setDeleteItemID(null);
          }}
          disabled={!(actions.includes('admin') || actions.includes('delete'))}
          cancelButtonProps={{ type: 'text', style: { color: '#000' } }}
          onCancel={(e) => {
            e.stopPropagation();
            setModalOpen(false);
            setDeleteItemID(null);
          }}
        >
          <Typography.Text strong>Are you sure you want to delete this ?</Typography.Text>
        </Modal>
      </ConfigProvider>
    </Space>
  );
}

export default TagList;
