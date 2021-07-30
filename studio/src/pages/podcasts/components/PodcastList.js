import React from 'react';
import { Popconfirm, Button, Table, Space } from 'antd';

import { useDispatch } from 'react-redux';
import { deletePodcast } from '../../../actions/podcasts';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function PodcastList({ actions, data, filters, setFilters, fetchPodcasts }) {
  const dispatch = useDispatch();
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => {
        return (
          <Link
            className="ant-dropdown-link"
            style={{
              marginRight: 8,
            }}
            to={`/podcasts/${record.id}/edit`}
          >
            {record.title}
          </Link>
        );
      },
    },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Season', dataIndex: 'season', key: 'season' },
    { title: 'Podcast', dataIndex: 'podcast', key: 'podcast' },
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
            onConfirm={() => dispatch(deletePodcast(record.id)).then(() => fetchPodcasts())}
          >
            <Link to="" className="ant-dropdown-link">
              <Button
                icon={<DeleteOutlined />}
                disabled={!(actions.includes('admin') || actions.includes('delete'))}
                type="danger"
              />
            </Link>
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
        dataSource={data.podcasts}
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

export default PodcastList;
