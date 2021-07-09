import { UserOutlined } from '@ant-design/icons';
import { Menu, Dropdown } from 'antd';
import React from 'react';
import { LogoutOutlined, DownOutlined } from '@ant-design/icons';

const AccountMenu = () => {
  const accountMenu = (
    <Menu>
      <Menu.Item>
        <a href={window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/browser/flows/logout'}>
          <LogoutOutlined />
          Logout
        </a>
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={accountMenu} placement="topRight">
      <span>
        <UserOutlined title="Spaces" />
        <DownOutlined />
      </span>
    </Dropdown>
  );
};

export default AccountMenu;
