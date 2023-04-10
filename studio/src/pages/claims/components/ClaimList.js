import React from 'react';
import {
  Popconfirm, Button, Table, Space, Typography, Modal, ConfigProvider,
} from 'antd';
import { useDispatch } from 'react-redux';
import { deleteClaim } from '../../../actions/claims';
import { Link, useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import { DeleteOutlined } from '@ant-design/icons';

function ClaimList({ actions, data, filters, fetchClaims, onPagination }) {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = React.useState(false);
  const history = useHistory();
  const columns = [
    {
      title: 'Claim',
      dataIndex: 'claim',
      key: 'claim',
      width: '30%',
      render: (_, record) => {
        return (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/claims/${record.id}/edit`}
          >
            <Typography.Text style={{ color: '#101828' }} strong>
              {record.claim}</Typography.Text>
          </Link>
        );
      },
    },
    {
      title: 'Claimant', dataIndex: 'claimant', key: 'claimant',
      width: '20%',
      render: (_, record) => {
        return (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/claimants/${record.claimant_id}/edit`}
          >
            <Typography.Text style={{ color: '#101828' }} strong>
              {record.claimant}</Typography.Text>
          </Link>
        );
      }
    },
    {
      title: 'Rating', dataIndex: 'rating', key: 'rating', width: '20%',
      render: (_, record) => {
        return (
          <Link to={`/ratings/${record.rating_id}/edit`}>
            <Typography.Text style={{ color: '#101828' }} strong>
              {record.rating}</Typography.Text>
          </Link>
        );
      }
    },
    {
      title: 'Claim Date',
      dataIndex: 'claim_date',
      width: '20%',
      render: (_, record) => {
        return (
          <Typography.Text style={{ color: '#101828' }} strong>
            <span title={record.claim_date}>
              {record.claim_date ? dayjs(record.claim_date).format('MMMM Do YYYY') : null}
            </span>
          </Typography.Text>
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
          > <Button
              size="large"
              icon={<DeleteOutlined style={{ color: '#858585' }} />}
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
              disabled={!(actions.includes('admin') || actions.includes('delete'))}
            />
            <Modal
              open={modalOpen}
              closable={false}
              centered
              width={311}
              className="delete-modal-container"
              cancelButtonProps={{ type: 'text', style: { color: '#000' } }}
              style={{
                borderRadius: '18px',
              }}
              onOk={() => {
                dispatch(deleteClaim(record.id)).then(() => fetchClaims())
              }}
              onCancel={(e) => {
                e.stopPropagation();
                setModalOpen(false);
              }}
            >
              <Typography.Text strong>Are you sure you want to delete this claim?</Typography.Text>
            </Modal>
          </ConfigProvider>
        );
      },
    },
  ];

  return (
    <Space direction="vertical">
      <Table
        onRow={(record, rowIndex) => {
          return {
            onClick: (event) => {
              history.push(`/claims/${record.id}/edit`);
            },
            onMouseEnter: (event) => {
              document.body.style.cursor = 'pointer';
            },
            onMouseLeave: (event) => {
              document.body.style.cursor = 'default';
            },
          };
        }}
        columns={columns}
        dataSource={data.claims}
        loading={data.loading}
        rowKey={'id'}
        scroll={{
          x: "1000",
        }}
        pagination={{
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
          total: data.total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) => onPagination(pageNumber, pageSize),
          pageSizeOptions: ['10', '15', '20'],
        }}
      />
    </Space>
  );
}

export default ClaimList;
