import React from 'react';
import { Popconfirm, Button, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { deleteEvent, getEvents } from '../../../actions/events';
import { Link } from 'react-router-dom';
import deepEqual from 'deep-equal';

function EventList() {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  const { events, total, loading } = useSelector((state) => {
    const node = state.events.req.find((item) => {
      return deepEqual(item.query, filters);
    });
    if (node)
      return {
        events: node.data.map((element) => state.events.details[element]),
        total: node.total,
        loading: state.events.loading,
      };
    return { events: [], total: 0, loading: state.events.loading };
  });

  React.useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = () => {
    dispatch(getEvents(filters));
  };
  const getName = (eventLabel) => {
    var labelArr = eventLabel.split('.');
    for (var i = 0; i < labelArr.length; i++) {
      labelArr[i] = labelArr[i][0].toUpperCase() + labelArr[i].slice(1);
    }
    return labelArr.join(' ');
  };
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => {
        return <p>{getName(record.name)}</p>;
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
              to={`/events/${record.id}/edit`}
            >
              <Button>Edit</Button>
            </Link>
            <Popconfirm
              title="Sure to Delete?"
              onConfirm={() => dispatch(deleteEvent(record.id)).then(() => fetchEvents())}
            >
              <Link to="" className="ant-dropdown-link">
                <Button>Delete</Button>
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
      dataSource={events}
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

export default EventList;
