import { UserOutlined } from '@ant-design/icons';
import { Menu, Dropdown } from 'antd';
import React from 'react';
import classNames from 'classnames';
import HeaderDropdown from './HeaderDropdown';
import { LogoutOutlined, DownOutlined } from '@ant-design/icons';

const AccountMenu = (props) => {
  const { className } = props;

  const accountMenu = (
    <Menu selectedKeys={['en-US']}>
      <Menu.Item>
        <a href={process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/browser/flows/logout'}>
          <LogoutOutlined />
          {` `} Logout
        </a>
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={accountMenu} placement="topRight">
      <span className="dropdown">
        <UserOutlined title="Spaces" />
        {` `}
        <DownOutlined />
      </span>
    </Dropdown>
  );
};

export default AccountMenu;
