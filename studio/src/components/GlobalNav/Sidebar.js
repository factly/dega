import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Popover, List, Avatar, Button } from 'antd';
import routes, { sidebarMenu } from '../../config/routesConfig';
import _ from 'lodash';
import { setCollapse } from './../../actions/sidebar';
import { setSpaceSelectorPage } from './../../actions/spaceSelectorPage';
import AccountMenu from './AccountMenu';
import {
  AppstoreOutlined,
  DownOutlined,
  MenuFoldOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import Search from '../Search';
import { maker } from '../../utils/sluger';
import degaImg from '../../assets/dega.png';

const { Sider } = Layout;
const { SubMenu } = Menu;

function Sidebar({ superOrg, permission, orgs, loading, applications, services, menuKey }) {
  const { collapsed } = useSelector((state) => state.sidebar);
  const dispatch = useDispatch();
  const { details, selected } = useSelector((state) => state.spaces);
  const { navTheme } = useSelector((state) => state.settings);
  const [showCoreMenu, setCoreMenu] = useState(false);
  const onCollapse = (collapsed) => {
    collapsed ? dispatch(setCollapse(true)) : dispatch(setCollapse(false));
  };

  if (loading) {
    return null;
  }
  let resource = [
    'home',
    'dashboard',
    'analytics',
    'google',
    'factly',
    'policies',
    'users',
    'spaces',
    'sach',
  ];
  let protectedResources = [
    'posts',
    'pages',
    'categories',
    'tags',
    'media',
    'formats',
    'claims',
    'claimants',
    'ratings',
    'organisations',
    'menus',
    'fact-checks',
    'episodes',
    'podcasts',
    'events',
    'webhooks',
    'website',
    'advanced',
    'members',
    'code-injection',
    'requests',
    'permissions',
  ];
  let buttonStyle = {
    width: '40px',
    height: '40px',
    background: '#DCE4E7',
    borderRadius: '21px',
    padding: '0.25rem 0.5rem',
  };
  permission.forEach((each) => {
    if (each.resource === 'admin') {
      resource = resource.concat(protectedResources);
      if (!showCoreMenu) {
        setCoreMenu(true);
      }
    } else {
      if (!showCoreMenu && protectedResources.includes(each.resource)) {
        setCoreMenu(true);
      }
      resource.push(each.resource);
    }
  });
  if (orgs[0]?.permission.role === 'owner') resource = resource.concat(protectedResources);
  const getMenuItems = (children, index, title) =>
    children.map((route, childIndex) => {
      return resource.includes(route.title.toLowerCase()) ? (
        ['Events', 'Permissions'].indexOf(route.title) !== -1 &&
        route.isAdmin !== superOrg.is_admin ? null : (
          <Menu.Item key={route.menuKey}>
            <Link to={route.path}>
              <span>{route.title}</span>
            </Link>
          </Menu.Item>
        )
      ) : null;
    });

  const getSubMenuItems = (menu, index, Icon) => (
    <SubMenu
      key={index}
      title={menu.title}
      icon={<Icon style={{ color: '#000', fontSize: '15px', fontWeight: '700' }} />}
    >
      {menu.submenu && menu.submenu.length > 0 ? (
        <>
          {menu.submenu.map((submenuItem, index) => {
            return orgs[0]?.permission.role === 'owner' ? (
              <SubMenu key={submenuItem.title + index} title={submenuItem.title}>
                {getMenuItems(submenuItem.children, index, submenuItem.title)}
              </SubMenu>
            ) : (
              <SubMenu key={submenuItem.title + index} title={submenuItem.title}>
                {getMenuItems(submenuItem.children, index, submenuItem.title)}
              </SubMenu>
            );
          })}
        </>
      ) : null}
      {getMenuItems(menu.children, index, menu.title)}
    </SubMenu>
  );

  return (
    <Sider
      breakpoint="xl"
      className="main-sidebar"
      width="264px"
      theme={navTheme}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      collapsedWidth={48}
      trigger={null}
      style={{
        position: 'sticky',
        background: '#f0f2f5',
        left: 0,
        top: 0,
        overflow: 'auto',
        height: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: collapsed ? '0 0.5rem' : '0 24px',
          position: 'sticky',
          top: 0,
          gap: '8px',
          height: collapsed && '100px',
          zIndex: 100,
          background: '#F1F1F1',
        }}
      >
        <div className="menu-header" style={{ width: '100%' }}>
          {collapsed ? (
            <img
              alt="logo"
              className="menu-logo"
              src={
                details[selected]?.fav_icon?.url?.[
                  window.REACT_APP_ENABLE_IMGPROXY ? 'proxy' : 'raw'
                ] || degaImg
              }
            />
          ) : (
            <Button
              style={{
                background: '#DCE4E7',
                width: '100%',
                color: '#1E1E1E',
                border: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                display: 'flex',
                marginTop: '0.8rem',
                height: '43px',
                padding: '9px, 6px, 9px, 6px',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              type="primary"
              onClick={() => dispatch(setSpaceSelectorPage(true))}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar
                  src={
                    details[selected]?.fav_icon?.url?.[
                      window.REACT_APP_ENABLE_IMGPROXY ? 'proxy' : 'raw'
                    ] || degaImg
                  }
                />
                {details[selected]?.name}
              </div>
              <DownOutlined />
            </Button>
          )}
        </div>
        <Search collapsed={collapsed} />
      </div>
      <Menu
        theme={navTheme}
        mode="inline"
        className="slider-menu"
        defaultOpenKeys={['0', '1']}
        style={{ background: '#F1F1F1', padding: '8px' }}
        selectedKeys={menuKey}
      >
        {sidebarMenu.map((menu, index) => {
          const { Icon } = menu;
          return menu.title === 'CORE' && !showCoreMenu
            ? null
            : !menu.isService
            ? !menu.isAdmin
              ? getSubMenuItems(menu, index, Icon)
              : permission.filter((each) => each.resource === 'admin').length > 0
              ? getSubMenuItems(menu, index, Icon)
              : null
            : services?.includes(maker(menu.title))
            ? getSubMenuItems(menu, index, Icon)
            : null;
        })}
      </Menu>
      {!collapsed ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 24px',
            lineHeight: '40px',
            alignItems: 'center',
            width: '100%',
            position: 'absolute',
            bottom: '0',
            background: '#f0f2f5',
          }}
        >
          <AccountMenu />
          <div>
            <Link to="/settings">
              <Button style={{ ...buttonStyle }}>
                <SettingOutlined />
              </Button>
            </Link>
            {applications.length > 0 ? (
              <>
                <Popover
                  placement="top"
                  overlayInnerStyle={{ paddingBottom: 0 }}
                  content={
                    <List
                      grid={{
                        gutter: 16,
                        column: 3,
                      }}
                      dataSource={applications}
                      renderItem={(item) => (
                        <List.Item>
                          <a
                            href={item.url}
                            style={{
                              margin: '8px',
                              textDecoration: 'none',
                              color: 'inherit',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            {item.medium && item.medium.url ? (
                              <img alt="logo" className="menu-logo" src={item.medium.url.raw} />
                            ) : (
                              <Avatar shape="square" size={35}>
                                {item.name.charAt(0)}
                              </Avatar>
                            )}
                            <span>{item.name}</span>
                          </a>
                        </List.Item>
                      )}
                    />
                  }
                  trigger="click"
                >
                  <Button style={{ ...buttonStyle, marginLeft: '0.25rem' }}>
                    <AppstoreOutlined />
                  </Button>
                </Popover>
              </>
            ) : null}
            <Button
              style={{ ...buttonStyle, marginLeft: '0.25rem' }}
              onClick={() => onCollapse(true)}
            >
              <MenuFoldOutlined />
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 8px',
            lineHeight: '40px',
            alignItems: 'center',
            width: '100%',
            position: 'absolute',
            bottom: '0',
            background: '#f0f2f5',
          }}
        >
          <Button style={buttonStyle} onClick={() => onCollapse(false)}>
            <MenuUnfoldOutlined />
          </Button>
        </div>
      )}
    </Sider>
  );
}
export default Sidebar;
