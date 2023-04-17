import React from 'react';
import { ConfigProvider, Button, Table, Modal, Typography } from 'antd';

import { useDispatch } from 'react-redux';
import { deleteRating } from '../../../actions/ratings';
import { Link, useHistory } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function RatingList({ actions, data, filters, setFilters, fetchRatings }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = React.useState(false);
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
            to={`/ratings/${record.id}/edit`}
          >
            <Typography.Text style={{ color: '#101828' }} strong>
              {record.name}
            </Typography.Text>
          </Link>
        );
      },
    },
    {
      title: 'Rating Value',
      dataIndex: 'numeric_value',
      key: 'numeric_value',
      onCell: () => {
        return {
          style: {
            minWidth: '200px',
          },
        };
      },
      width: 200,
      render: (_, record) => {
        return (
          <Typography.Text style={{ color: '#101828' }} strong>
            {record.numeric_value}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Preview',
      dataIndex: 'preview',
      onCell: () => {
        return {
          style: {
            minWidth: '200px',
          },
        };
      },
      width: 200,
      render: (_, record) => (
        <div
          style={{
            color: record.text_colour?.hex,
            backgroundColor: record.background_colour?.hex,
            width: '100px',
            border: '1px solid black',
            padding: '0.5rem',
            textAlign: 'center',
          }}
        >
          {record.name}
        </div>
      ),
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
                Modal: {
                  colorBgMask: '#0000000B',
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
                dispatch(deleteRating(record.id)).then(() => fetchRatings());
                // alert(record.id)
                // console.log(record)
                setModalOpen(false);
              }}
              onCancel={(e) => {
                e.stopPropagation();
                setModalOpen(false);
              }}
            >
              <Typography.Text strong>Are you sure you want to delete this rating?</Typography.Text>
            </Modal>
          </ConfigProvider>
        );
      },
    },
  ];

  return (
    <Table
      onRow={(record, rowIndex) => {
        return {
          onClick: (event) => {
            history.push(`/ratings/${record.id}/edit`);
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
      dataSource={data.ratings}
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
        onChange: (pageNumber, pageSize) => setFilters({ page: pageNumber, limit: pageSize }),
        pageSizeOptions: ['10', '15', '20'],
      }}
    />
  );
}

export default RatingList;
