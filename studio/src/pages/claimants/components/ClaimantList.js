import React from 'react';
import { Button, Typography, Table, Space, Modal, ConfigProvider } from 'antd';
import { useDispatch } from 'react-redux';
import { deleteClaimant } from '../../../actions/claimants';
import { Link, useHistory } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function ClaimantList({ actions, data, filters, setFilters, fetchClaimants }) {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = React.useState(false);
  const history = useHistory();

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '50%',
      render: (_, record) => {
        return (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/claimants/${record.id}/edit`}
          >
            <Typography.Text style={{ color: '#101828' }} strong>
              {record.name}
            </Typography.Text>
          </Link>
        );
      },
    },
    {
      title: 'Tag Line',
      dataIndex: 'tag_line',
      key: 'tag_line',
      width: '40%',
      render: (_, record) => {
        return (
          <Typography.Paragraph style={{ color: '#101828' }} strong ellipsis={{ rows: 2 }}>
            {record.tag_line}
          </Typography.Paragraph>
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
            {' '}
            <Button
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
              onOk={(e) => {
                e.stopPropagation();
                dispatch(deleteClaimant(record.id)).then(() => fetchClaimants());
                setModalOpen(false);
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
    <Space direction={'vertical'}>
      <Table
        onRow={(record, rowIndex) => {
          return {
            onClick: (event) => {
              history.push(`/claimants/${record.id}/edit`);
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
        dataSource={data.claimants}
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

export default ClaimantList;
