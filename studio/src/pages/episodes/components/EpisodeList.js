import React from 'react';
import { Popconfirm, Button, Table, Space } from 'antd';

import { useDispatch } from 'react-redux';
import { deleteEpisode } from '../../../actions/episodes';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function EpisodeList({ actions, data, filters, setFilters, fetchEpisodes }) {
  const dispatch = useDispatch();
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => {
        return (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/episodes/${record.id}/edit`}
          >
            {record.title}
          </Link>
        );
      },
    },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Season', dataIndex: 'season', key: 'season' },
    { title: 'Episode', dataIndex: 'episode', key: 'episode' },
    {
      title: 'Action',
      dataIndex: 'operation',
      fixed: 'right',
      align: 'center',
      width: 150,
      render: (_, record) => {
        return (
          <Popconfirm
            title="Are you sure you want to delete this?"
            onConfirm={() => dispatch(deleteEpisode(record.id)).then(() => fetchEpisodes())}
          >
            <Button
              icon={<DeleteOutlined />}
              disabled={!(actions.includes('admin') || actions.includes('delete'))}
              type="danger"
            />
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Space direction={'vertical'}>
      <Table
        bordered
        columns={columns}
        dataSource={data.episodes}
        loading={data.loading}
        rowKey={'id'}
        pagination={{
          total: data.total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) =>
            setFilters({ ...filters, page: pageNumber, limit: pageSize }),
        }}
      />
    </Space>
  );
}

export default EpisodeList;
