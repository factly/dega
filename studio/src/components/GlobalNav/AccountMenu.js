import { UserOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Button, Avatar } from 'antd';
import React from 'react';
import { LogoutOutlined, DownOutlined, EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile } from '../../actions/profile';

const AccountMenu = ({ signOut }) => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => {
    return {
      profile: state.profile.details ? state.profile.details : null,
      loading: state.profile.loading,
    };
  });
  React.useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  const handleLogout = () => {
    // clear all local storage and cookies
    localStorage.clear();
  };

  const accountMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">
          <EditOutlined /> Profile
        </Link>
      </Menu.Item>
      <Menu.Item key="logout">
        <Button onClick={handleLogout} icon={<LogoutOutlined />} danger>
          Logout
        </Button>
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={accountMenu} placement="topLeft">
      <div className="user-menu">
        <Button
          style={{
            borderRadius: '50px',
            background: '#DCE4E7',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0.5rem',
          }}
        >
          {!loading && profile && profile.medium ? (
            <Avatar
              size="small"
              src={profile.medium.url?.[window.REACT_APP_ENABLE_IMGPROXY ? 'proxy' : 'raw']}
              title="Spaces"
              style={{ fontSize: '1.25rem' }}
            />
          ) : (
            <UserOutlined title="Spaces" style={{ fontSize: '1.25rem', padding: '0.25rem' }} />
          )}
          <DownOutlined style={{ fontSize: '0.5rem', marginLeft: '0.25rem' }} />
        </Button>
      </div>
    </Dropdown>
  );
};

export default AccountMenu;
