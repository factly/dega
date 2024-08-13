import React from 'react';
import { Button, Table, Space, Typography, Modal, ConfigProvider } from 'antd';

import { useDispatch } from 'react-redux';
import { deleteEpisode } from '../../../actions/episodes';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';
import useNavigation from '../../../utils/useNavigation';

function EpisodeList({ actions, data, filters, setFilters, fetchEpisodes }) {
  const dispatch = useDispatch();
  const history = useNavigation();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteItemId, setDeleteItemId] = React.useState(null);

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
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
            to={`/episodes/${record?.id}/edit`}
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
      title: 'Episode',
      dataIndex: 'episode',
      key: 'episode',
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
              {record?.episode}
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
          scroll={{
            x: '1000',
          }}
          columns={columns}
          dataSource={data.episodes}
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
            dispatch(deleteEpisode(deleteItemId)).then(() => fetchEpisodes());
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

export default EpisodeList;
