import { UserOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Button } from 'antd';
import React from 'react';
import { LogoutOutlined, DownOutlined, EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const AccountMenu = () => {
  /**
   * TODO: Update Icon to show profile picture of User
   */
  const accountMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">
          <EditOutlined /> Profile
        </Link>
      </Menu.Item>
      <Menu.Item key="logout">
        <a href={window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/browser/flows/logout'}>
          <LogoutOutlined />
          Logout
        </a>
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={accountMenu} placement="topLeft">
      <div className="user-menu">
        <Button
          style={{
            borderRadius: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0.5rem',
          }}
        >
          <UserOutlined title="Spaces" style={{ fontSize: '1.25rem', padding: '0.25rem' }} />
          <DownOutlined style={{ fontSize: '0.5rem', marginLeft: '0.25rem' }} />
        </Button>
      </div>
    </Dropdown>
  );
};

export default AccountMenu;
