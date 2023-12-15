import React from 'react';
import { Button, Table, Space, Typography, Modal, ConfigProvider } from 'antd';
import { useDispatch } from 'react-redux';
import { deleteClaim } from '../../../actions/claims';
import { Link  } from 'react-router-dom';
import dayjs from 'dayjs';
import { DeleteOutlined } from '@ant-design/icons';
import useNavigation from '../../../utils/useNavigation';

function ClaimList({ actions, data, filters, fetchClaims, onPagination }) {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteItemId, setDeleteItemId] = React.useState(null);

  const history = useNavigation();
  const columns = [
    {
      title: 'Claim',
      dataIndex: 'claim',
      width: 200,
      key: 'claim',
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
            to={`/claims/${record.id}/edit`}
          >
            <Typography.Text style={{ color: '#101828' }} strong>
              {record.claim}
            </Typography.Text>
          </Link>
        );
      },
    },
    {
      title: 'Claimant',
      dataIndex: 'claimant',
      key: 'claimant',
      // width: '20%',
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
            to={`/claimants/${record.claimant_id}/edit`}
          >
            <Typography.Text style={{ color: '#101828' }} strong>
              {record.claimant}
            </Typography.Text>
          </Link>
        );
      },
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      // width: '20%',
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
          <Link to={`/ratings/${record.rating_id}/edit`}>
            <Typography.Text style={{ color: '#101828' }} strong>
              {record.rating}
            </Typography.Text>
          </Link>
        );
      },
    },
    {
      title: 'Claim Date',
      dataIndex: 'claim_date',
      // width: '20%',
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
            {' '}
            <Button
              size="large"
              icon={<DeleteOutlined style={{ color: '#858585' }} />}
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
                setDeleteItemId(record.id);
              }}
              disabled={!(actions.includes('admin') || actions.includes('delete'))}
            />
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
      <Space direction="vertical">
        <Table
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                history(`/claims/${record.id}/edit`);
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
            x: '1000',
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
          onOk={(e) => {
            e.stopPropagation();
            dispatch(deleteClaim(deleteItemId)).then(() => fetchClaims());
            setModalOpen(false);
            setDeleteItemId(null);
          }}
          onCancel={(e) => {
            e.stopPropagation();
            setModalOpen(false);
            setDeleteItemId(null);
          }}
        >
          <Typography.Text strong>Are you sure you want to delete this claim?</Typography.Text>
        </Modal>
      </Space>
    </ConfigProvider>
  );
}

export default ClaimList;
