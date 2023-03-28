import React from 'react';
import { Popconfirm, Button, Table, Tooltip, Switch } from 'antd';
import { useDispatch } from 'react-redux';
import { deleteWebhook, updateWebhook } from '../../../actions/webhooks';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function WebhookList({ actions, data, filters, setFilters, fetchWebhooks }) {
  const dispatch = useDispatch();

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (_, record) => {
        return (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/advanced/webhooks/${record.id}/edit`}
          >
            {record.name}
          </Link>
        );
      },
    },
    {
      title: 'Url',
      dataIndex: 'url',
      key: 'url',
      ellipsis: {
        showTitle: false,
      },
      render: (url) => (
        <Tooltip placement="topLeft" title={url}>
          {url}
        </Tooltip>
      ),
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      width: '10%',
      render: (_, webhook) => {
        return (
          <Switch
            checked={webhook.enabled}
            onClick={(value) =>
              dispatch(updateWebhook({ ...webhook, enabled: value, event_ids: webhook.events }))
            }
          />
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
          <Popconfirm
            title="Are you sure you want to delete this?"
            onConfirm={() => dispatch(deleteWebhook(record.id)).then(() => fetchWebhooks())}
            disabled={!(actions.includes('admin') || actions.includes('delete'))}
          >
            <Button
              icon={<DeleteOutlined />}
              disabled={!(actions.includes('admin') || actions.includes('delete'))}
              danger
            />
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Table
      bordered
      columns={columns}
      dataSource={data.webhooks}
      loading={data.loading}
      rowKey={'id'}
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

export default WebhookList;
