import React from 'react';
import { Popconfirm, Button, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getWebhooks, deleteWebhook } from '../../../actions/webhooks';
import { Link } from 'react-router-dom';
import deepEqual from 'deep-equal';

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
    { title: 'Url', dataIndex: 'url', key: 'url' },
    {
      title: '',
      dataIndex: 'enabled',
      render: (_, record) => {
        return <p>{record.enabled ? 'Enabled' : 'Disabled'}</p>;
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_, record) => {
        return (
          <span>
            <Link
              className="ant-dropdown-link"
              style={{
                marginRight: 8,
              }}
              to={`/webhooks/${record.id}/edit`}
            >
              <Button
              //disabled={!(actions.includes('admin') || actions.includes('update'))}
              >
                Edit
              </Button>
            </Link>
            <Popconfirm
              title="Sure to Delete?"
              onConfirm={() => dispatch(deleteWebhook(record.id)).then(() => fetchWebhooks())}
            >
              <Link to="" className="ant-dropdown-link">
                <Button
                //disabled={!(actions.includes('admin') || actions.includes('delete'))}
                >
                  Delete
                </Button>
              </Link>
            </Popconfirm>
          </span>
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
