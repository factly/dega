import React from 'react';
import CategoriesList from './components/CategoriesList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Categories() {
  return (
    <Space direction="vertical">
      <Link key="1" to="/categories/create">
        <Button>Create New</Button>
      </Link>
      <CategoriesList />
    </Space>
  );
}

export default Categories;
