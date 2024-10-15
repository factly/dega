import { UserOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Button, Avatar } from 'antd';
import React from 'react';
import { LogoutOutlined, DownOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile } from '../../actions/profile';
import { Link } from 'react-router-dom';
import { EditOutlined } from '@ant-design/icons';

const AccountMenu = () => {
  const { profile, loading } = useSelector((state) => {
    return {
      profile: state.profile.details ? state.profile.details : null,
      loading: state.profile.loading,
    };
  });
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (Object.keys(profile).length === 0) {
      dispatch(getUserProfile());
    }
  }, [dispatch]);

  const handleLogout = async () => {
    const sessionId = localStorage.getItem('sessionId');
    const sessionToken = localStorage.getItem('sessionToken');

    if (sessionId && sessionToken) {
      try {
        const response = await fetch(
          `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/sessions/${sessionId}`,
          {
            method: 'DELETE',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('sessionToken')}`,
            },
            body: JSON.stringify({
              sessionToken: sessionToken,
            }),
          },
        );

        if (response.ok) {
          console.log('Logout successful');
        } else {
          console.error('Logout failed:', await response.text());
        }
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }

    // Clear local storage and reload the page
    window.localStorage.clear();
    window.location.reload(); // Redirect to the post-logout URL

    const postLogoutRedirectUri = window.REACT_APP_ZITADEL_POST_LOGOUT_REDIRECT_URI;
    if (postLogoutRedirectUri) {
      window.location.href = postLogoutRedirectUri;
    }
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
