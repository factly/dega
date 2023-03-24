import React from 'react';
import { Popconfirm, Button, Table, Space, Typography, Modal, ConfigProvider } from 'antd';

import { useDispatch } from 'react-redux';
import { deleteCategory } from '../../../actions/categories';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function CategoryList({ actions, data, filters, setFilters, fetchCategories }) {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = React.useState(false);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
      render: (_, record) => {
        return (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/categories/${record.id}/edit`}
          >
            <Typography.Text style={{ fontSize: '1rem' }}
              strong>
              {record.slug}
            </Typography.Text>
          </Link>
        );
      },
    },
    {
      title: 'Parent Category', dataIndex: ['parent_category'], key: 'parent_id',
      render: (_, record) => {
        return (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/categories/${record.id}/edit`}
          >
            <Typography.Text style={{ fontSize: '1rem' }}
              strong>
                {record.parent_category?.name}
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
                  colorPrimaryHover: '#F2F2F2',
                },
              },
            }}
          >
            <Button
              size="large"
              onClick={() => {
                setModalOpen(true);
              }}
              icon={<DeleteOutlined style={{ color: '#858585' }} />}
              disabled={!(actions.includes('admin') || actions.includes('delete'))}
            />
            <Modal
              open={modalOpen}
              closable={false}
              centered
              width={400}
              className="delete-modal-container"
              style={{
                borderRadius: '18px',
              }}
              onOk={() => dispatch(deleteCategory(record.id)).then(() => fetchCategories())}
              onCancel={() => {
                setModalOpen(false);
              }}
            >
              <p>Are you sure you want to delete this Page?</p>
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
        dataSource={data.categories}
        loading={data.loading}
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

export default CategoryList;
