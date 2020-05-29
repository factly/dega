import React from 'react';
import { Popconfirm, Space } from 'antd';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTags } from '../../../actions/tags';
import { Link } from 'react-router-dom';
import Table from '../../../components/Table';

function TagsList() {
  const dispatch = useDispatch();
  const { tags, loading } = useSelector((state) => state.tags);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Parent Tags', dataIndex: 'parent_id', key: 'parent_id' },
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
            <Popconfirm title="Sure to cancel?">
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
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetch = (params = {}) => {
    dispatch(getTags());
  };

  return (
    <Space direction="vertical">
      <Link className="ant-btn ant-btn-primary" key="1" to="/tags/create">
        Create New
      </Link>
      <Table
        columns={columns}
        expandable={{
          expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.description}</p>,
        }}
        dataSource={tags}
        loading={loading}
      />
    </Space>
  );
}

export default TagsList;
