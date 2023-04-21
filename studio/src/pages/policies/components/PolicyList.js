import React from 'react';
import { Modal, Button, Typography, Table, ConfigProvider } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { deletePolicy } from '../../../actions/policies';
import { Link, useHistory } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';

function PolicyList({ actions, data, filters, setFilters, fetchPolicies }) {
  const [modalOpen, setModalOpen] = React.useState(false);

  const dispatch = useDispatch();

  const history = useHistory();

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
          <Link
            style={{
              marginRight: 8,
            }}
            to={`settings/members/policies/${record.id}/edit`}
          >
            <Typography.Text style={{ fontSize: '1rem' }} strong>
              {record.name}
            </Typography.Text>
          </Link>
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
      render: (_, record) => {
        return (
          <Typography.Paragraph style={{ fontSize: '1rem' }} strong ellipsis={{ rows: 2 }}>
            {record.description}
          </Typography.Paragraph>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      align: 'center',
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
                pathname: `/settings/members/policies/${record.id}/view`,
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Button
                icon={<EyeOutlined style={{ color: '#858585' }} />}
                size="large"
                style={{
                  marginRight: 8,
                }}
              />
            </Link>
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
                dispatch(deletePolicy(record.id)).then(() => fetchPolicies());
                setModalOpen(false);
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
              history.push(`/settings/members/policies/${record.id}/edit`);
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
        dataSource={data.policies}
        loading={data.loading}
        rowKey={'name'}
        pagination={{
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
          total: data.total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) => setFilters({ page: pageNumber, limit: pageSize }),
          pageSizeOptions: ['10', '15', '20'],
        }}
      />
    </ConfigProvider>
  );
}

export default PolicyList;
