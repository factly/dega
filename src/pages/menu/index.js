import React from 'react';
import { Space, Button } from 'antd';
import MenuList from './components/MenuList';
import { Link } from 'react-router-dom';

function Menu() {
  return (
    <Space direction="vertical">
      <Link to="/menu/create">
        <Button>Create New</Button>
      </Link>
      <MenuList />
    </Space>
  );
}

export default Menu;
