import React from 'react';
import { Table } from 'antd';
import { getEventName } from '../../../../utils/event';
import { getDateAndTimeFromString } from '../../../../utils/date';
function WebhookLogsList({ data, filters, setFilters }) {
  const columns = [
    {
      title: 'Event',
      dataIndex: 'event',
      key: 'event',
      render: (_, record) => getEventName(record.event),
    },
    {
      title: 'Time',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (_, record) => getDateAndTimeFromString(record.created_at),
    },
  ];

  return (
    <Table
      bordered
      columns={columns}
      dataSource={data.webhooklogs}
      loading={data.loading}
      rowKey={'id'}
      pagination={{
        total: data.total,
        current: filters.page,
        pageSize: filters.limit,
        onChange: (pageNumber, pageSize) => setFilters({ page: pageNumber, limit: pageSize }),
        pageSizeOptions: ['10', '15', '20'],
      }}
    />
  );
}

export default WebhookLogsList;
