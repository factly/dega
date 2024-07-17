import { UserOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Button, Avatar } from 'antd';
import React from 'react';
import { LogoutOutlined, DownOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

const AccountMenu = () => {
  const { profile, loading } = useSelector((state) => {
    return {
      profile: state.profile.details ? state.profile.details : null,
      loading: state.profile.loading,
    };
  });

  React.useEffect(() => {
    if(Object.keys(profile).length === 0){
      dispatch(getUserProfile());
    }
  }, [dispatch]);


  const handleLogout = () => {
    const logoutUrl =
      `${window.REACT_APP_ZITADEL_AUTHORITY}/oidc/v1/end_session?` +
      `id_token_hint=${localStorage.getItem('x-zitadel-id-token')}&` +
      `post_logout_redirect_uri=${encodeURIComponent(
        window.REACT_APP_ZITADEL_POST_LOGOUT_REDIRECT_URI,
      )}`;

    window.localStorage.clear();
    window.location.reload();
    window.location.href = logoutUrl;
  };

  const accountMenu = (
    <Menu>
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
