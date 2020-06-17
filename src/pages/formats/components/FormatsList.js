import React, { useState } from 'react';
import { Popconfirm, Space } from 'antd';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFormats, deleteFormat } from '../../../actions/formats';
import { Link } from 'react-router-dom';
import Table from '../../../components/Table';

function FormatsList() {
  const dispatch = useDispatch();
  const { details, loading, req, total } = useSelector((state) => state.formats);

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

  const onConfirm = (id) => dispatch(deleteFormat(id));

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
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
              to={`/formats/edit?id=${record.id}`}
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
    },
  ];

  useEffect(() => {
    handleTableChange(pagination);
  }, [total]);

  const handleTableChange = ({ current, pageSize }) => {
    dispatch(getFormats({ page: current, limit: pageSize }));
    setPagination({ ...pagination, current, pageSize, total });
  };

  return (
    <Space direction="vertical">
      <Link className="ant-btn ant-btn-primary" key="1" to="/formats/create">
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

export default FormatsList;
