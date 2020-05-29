import React from 'react';
import { Popconfirm, Form, Space, Button } from 'antd';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories } from '../../../actions/categories';
import { Link } from 'react-router-dom';
import Table from '../../../components/Table';
import _ from 'lodash';

function CategoriesList() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Parent Category', dataIndex: 'parent_id', key: 'parent_id' },
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
              to={`/categories/edit?id=${record.id}`}
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
    dispatch(getCategories());
  };

  return (
    <Space direction="vertical">
      <Link className="ant-btn ant-btn-primary" key="1" to="/categories/create">
        Create New
      </Link>
      <Table
        columns={columns}
        expandable={{
          expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.description}</p>,
        }}
        dataSource={categories}
        loading={loading}
      />
    </Space>
  );
}

export default CategoriesList;
