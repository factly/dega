import React from 'react';
import { Popconfirm, Button, Table, Tooltip } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getWebhooks, deleteWebhook } from '../../../actions/webhooks';
import { Link } from 'react-router-dom';
import deepEqual from 'deep-equal';
import { DeleteOutlined } from '@ant-design/icons';

function WebhookList({ actions }) {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  const { webhooks, total, loading } = useSelector((state) => {
    const node = state.webhooks.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        webhooks: node.data.map((element) => state.webhooks.details[element]),
        total: node.total,
        loading: state.webhooks.loading,
      };
    return { webhooks: [], total: 0, loading: state.webhooks.loading };
  });

  React.useEffect(() => {
    fetchWebhooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchWebhooks = () => {
    dispatch(getWebhooks(filters));
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (_, record) => {
        return (
          <Link
            className="ant-dropdown-link"
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
      render: (_, record) => {
        return <p>{record.enabled ? 'Yes' : 'No'}</p>;
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
    <Table
      bordered
      columns={columns}
      dataSource={webhooks}
      loading={loading}
      rowKey={'id'}
      pagination={{
        total: total,
        current: filters.page,
        pageSize: filters.limit,
        onChange: (pageNumber, pageSize) => setFilters({ page: pageNumber, limit: pageSize }),
      }}
    />
  );
}

export default WebhookList;
