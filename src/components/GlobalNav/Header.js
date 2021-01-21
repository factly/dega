import React from 'react';
import { Divider, Layout, Popover, List } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import AccountMenu from './AccountMenu';
import SpaceSelector from './SpaceSelector';

function Header({ applications }) {
  return (
    <Layout.Header className="layout-header">
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <SpaceSelector />

        {applications.length > 0 ? (
          <>
            <Divider type="vertical" />
            <Popover
              placement="bottom"
              content={
                <List
                  grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 4,
                    lg: 4,
                    xl: 6,
                    xxl: 3,
                  }}
                  dataSource={applications}
                  renderItem={(item) => (
                    <List.Item>
                      <a href={item.url} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <img
                          alt="logo"
                          className="menu-logo"
                          src={require(`../../assets/${item.name.toLowerCase()}_icon.png`)}
                        />
                        <p>{item.name}</p>
                      </a>
                    </List.Item>
                  )}
                />
              }
              trigger="click"
            >
              <AppstoreOutlined />
            </Popover>
          </>
        ) : null}
        <Divider type="vertical" />
        <AccountMenu />
      </div>
    </Layout.Header>
  );
}

export default Header;
