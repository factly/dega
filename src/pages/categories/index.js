import React from 'react';
import CategoryList from './components/CategoryList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Categories() {
  return (
    <Space direction="vertical">
      <Link key="1" to="/categories/create">
        <Button>Create New</Button>
      </Link>
      <CategoryList />
    </Space>
  );
}

export default Categories;
