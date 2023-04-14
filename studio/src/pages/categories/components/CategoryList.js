import React from 'react';
import { Popconfirm, Button, Table, Space, Typography, Modal, ConfigProvider } from 'antd';

import { useDispatch } from 'react-redux';
import { deleteCategory } from '../../../actions/categories';
import { Link, useHistory } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function CategoryList({ actions, data, filters, setFilters, fetchCategories }) {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = React.useState(false);
  const history = useHistory();

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 400,
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
            to={`/categories/${record.id}/edit`}
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
      key: 'slug',
      width: 400,
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
            to={`/categories/${record.id}/edit`}
          >
            <Typography.Text style={{ fontSize: '1rem' }} strong>
              {record.slug}
            </Typography.Text>
          </Link>
        );
      },
    },
    {
      title: 'Parent Category',
      dataIndex: ['parent_category'],
      key: 'parent_id',
      width: 200,
      onCell: () => {
        return {
          style: {
            minWidth: '150px',
          },
        };
      },
      render: (_, record) => {
        return (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/categories/${record.id}/edit`}
          >
            <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
              {record.parent_category?.name}
            </Typography.Text>
          </Link>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
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
                dispatch(deleteCategory(record.id)).then(() => fetchCategories());
                setModalOpen(false);
              }}
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
    <Space direction="vertical">
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
          dataSource={data.categories}
          loading={data.loading}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                history.push(`/categories/${record.id}/edit`);
              },
              onMouseEnter: (event) => {
                document.body.style.cursor = 'pointer';
              },
              onMouseLeave: (event) => {
                document.body.style.cursor = 'default';
              },
            };
          }}
          rowKey={'id'}
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
      </ConfigProvider>
    </Space>
  );
}

export default CategoryList;
