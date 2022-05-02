import React from 'react';
import { Space, Button, Row } from 'antd';
import MenuList from './components/MenuList';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import getUserPermission from '../../utils/getUserPermission';
import { Helmet } from 'react-helmet';

function Menu() {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'menus', action: 'get', spaces });
  return (
    <Space direction="vertical">
      <Helmet title={'Menu'} />
      <Row justify="end">
        <Link to="/website/menus/create">
          <Button
            disabled={!(actions.includes('admin') || actions.includes('create'))}
            type="primary"
          >
            New Menu
          </Button>
        </Link>
      </Row>

      <MenuList actions={actions} />
    </Space>
  );
}

export default Menu;
