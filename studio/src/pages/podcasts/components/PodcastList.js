import React from 'react';
import { Button, Table, Space, Typography, Modal, ConfigProvider } from 'antd';

import { useDispatch } from 'react-redux';
import { deletePodcast } from '../../../actions/podcasts';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';
import useNavigation from '../../../utils/useNavigation';

function PodcastList({ actions, data, filters, setFilters, fetchPodcasts }) {
  const dispatch = useDispatch();
  const history = useNavigation();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteItemId, setDeleteItemId] = React.useState(null);

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
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
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/podcasts/${record?.id}/edit`}
          >
            <Typography.Text style={{ color: '#101828' }} strong>
              {record?.title}
            </Typography.Text>
          </Link>
        );
      },
    },
    {
      title: 'Season',
      dataIndex: 'season',
      key: 'season',
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
            to={`/podcasts/${record?.id}/edit`}
          >
            <Typography.Text style={{ color: '#101828' }} strong>
              {record?.season}
            </Typography.Text>
          </Link>
        );
      },
    },
    {
      title: 'Podcast',
      dataIndex: 'podcast',
      key: 'podcast',
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
            to={`/podcasts/${record?.id}/edit`}
          >
            <Typography.Text style={{ color: '#101828' }} strong>
              {record?.podcast}
            </Typography.Text>
          </Link>
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
                Modal: {
                  colorBgMask: '#0000000B',
                },
              },
            }}
          >
            {' '}
            <Button
              size="large"
              style={{
                backgroundColor: 'red',
                borderColor: 'red',
                color: '#fff',
              }}
              icon={<DeleteOutlined style={{ color: '#fff' }} />}
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
      <Space direction={'vertical'}>
        <Table
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                history(`/podcasts/${record.id}/edit`);
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
          dataSource={data.podcasts}
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
          cancelButtonProps={{ type: 'text', style: { color: '#000' } }}
          style={{
            borderRadius: '18px',
          }}
          onOk={(e) => {
            e.stopPropagation();
            dispatch(deletePodcast(deleteItemId)).then(() => fetchPodcasts());
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

export default PodcastList;
