import React, { useState } from 'react';
import { Popconfirm, Space, Typography } from 'antd';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTags, deleteTag } from '../../../actions/tags';
import { Link } from 'react-router-dom';
import Table from '../../../components/Table';

function TagsList() {
  const dispatch = useDispatch();
  const { details, loading, req, total } = useSelector((state) => state.tags);

  const [pagination, setPagination] = useState({
    current: 1,
    defaultPageSize: 5,
    pageSize: 5,
    total,
  });

  var data = [];

  // map data based on query
  req.forEach((each) => {
    const { limit, page } = each.query;
    const { current, pageSize } = pagination;

    if (page == current && limit == pageSize) {
      data = each.ids.map((id) => details[id]);
    }
  });

  const onConfirm = (id) => dispatch(deleteTag(id));

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: '15%' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', width: '15%' },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '50%',
      render: (_, record) => {
        return (
          <Typography.Paragraph ellipsis={{ rows: 2 }}>{record.description}</Typography.Paragraph>
        );
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
              to={`/tags/edit?id=${record.id}`}
            >
              Edit
            </Link>
            <Popconfirm title="Sure to cancel?" onConfirm={() => onConfirm(record.id)}>
              <Link to="" className="ant-dropdown-link">
                Delete
              </Link>
            </Popconfirm>
          </span>
        );
      },
      width: '20%',
    },
  ];

  useEffect(() => {
    handleTableChange(pagination);
  }, [total]);

  const handleTableChange = ({ current, pageSize }) => {
    dispatch(getTags({ page: current, limit: pageSize }));
    setPagination({ ...pagination, current, pageSize, total });
  };

  return (
    <Space direction="vertical">
      <Link className="ant-btn ant-btn-primary" key="1" to="/tags/create">
        Create New
      </Link>
      <Table
        columns={columns}
        dataSource={data}
        onChange={handleTableChange}
        loading={loading}
        pagination={pagination}
      />
    </Space>
  );
}

export default TagsList;
