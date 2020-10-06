import React from 'react';
import CategoryList from './components/CategoryList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Categories({ permission }) {
  const { actions } = permission;
  return (
    <Space direction="vertical">
      <Link key="1" to="/categories/create">
        <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
          Create New
        </Button>
      </Link>
      <CategoryList actions={actions} />
    </Space>
  );
}

export default Categories;
