import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteMenu } from '../../../actions/menu';
import { Space, Button, Modal, Table, ConfigProvider, Typography } from 'antd';
import { Link, useHistory } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function MenuList({ actions, data, filters, setFilters, fetchMenus }) {
  const [modalOpen, setModalOpen] = React.useState(false);

  const dispatch = useDispatch();

  const history = useHistory();

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => {
        return (
          <Link
            className="andt-dropdown-link"
            style={{
              marginRight: 8,
            }}
            to={`/settings/website/menus/${record.id}/edit`}
          >
            <Typography.Text style={{ fontSize: '1rem' }} strong>
              {record.name}
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
              }}
              icon={<DeleteOutlined style={{ color: '#858585' }} />}
              disabled={!(actions.includes('admin') || actions.includes('delete'))}
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
                dispatch(deleteMenu(data.menus[0].id)).then(() => {
                  fetchMenus();
                  setModalOpen(false);
                  window.location.reload();
                });
              }}
              disabled={!(actions.includes('admin') || actions.includes('delete'))}
              cancelButtonProps={{ type: 'text', style: { color: '#000' } }}
              onCancel={(e) => {
                e.stopPropagation();
                setModalOpen(false);
              }}
            >
              <Typography.Text strong>Are you sure you want to delete this ?</Typography.Text>
            </Modal>
          </ConfigProvider>
        );
      },
    },
  ];
  return (
    <Space direction={'vertical'}>
      <Table
        columns={columns}
        dataSource={data.menus}
        loading={data.loading}
        onRow={(record, rowIndex) => {
          return {
            onClick: (event) => {
              history.push(`/settings/website/menus/${record.id}/edit`);
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
        rowKey={'id'}
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
    </Space>
  );
}

export default MenuList;
