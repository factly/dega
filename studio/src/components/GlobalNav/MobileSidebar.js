import React from 'react';
import { Avatar, Layout, Button, Row, Col, Drawer, Menu, Popover, List } from 'antd';
import degaImg from '../../assets/dega.png';
import { useSelector, useDispatch } from 'react-redux';
import routes, { sidebarMenu } from '../../config/routesConfig';
import {
  AppstoreOutlined,
  DownOutlined,
  MenuFoldOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import AccountMenu from './AccountMenu';
import { Link, useLocation } from 'react-router-dom';
import Search from '../Search';
import { setSpaceSelectorPage } from './../../actions/spaceSelectorPage';
import Sidebar from './Sidebar';
import { maker } from '../../utils/sluger';
import MenuIcon from '../../assets/MenuIcon';
import SearchIcon from '../../assets/SearchIcon';

function MobileSidebar({ superOrg, permission, orgs, loading, applications, services, menuKey }) {
  const { details, selected } = useSelector((state) => state.spaces);
  const { navTheme } = useSelector((state) => state.settings);
  const [open, setOpen] = React.useState(false);
  const showDrawer = () => {
    setOpen(true);
  };
  const dispatch = useDispatch();
  const [showCoreMenu, setCoreMenu] = React.useState(false);
  const onClose = () => {
    setOpen(false);
  };
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
    padding: '.5rem 0.5rem',
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
            <Link to={route.path} onClick={onClose}>
              <span>{route.title}</span>
            </Link>
          </Menu.Item>
        )
      ) : null;
    });

  const { SubMenu } = Menu;
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
    <>
      <Layout.Header
        className="mobile-sidebar"
        style={{
          background: '#F2F5F9',
          padding: 0,
        }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ position: 'sticky', top: 0, zIndex: 1 }}
        >
          <Col span={16}>
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
          </Col>
          <Col span={8} style={{ marginTop: '8px' }}>
            <Row justify="end" align="middle" gutter={[24, 16]}>
              <Col>
                <Search collapsed={true} Icon={() => <SearchIcon />} />
              </Col>
              <Col style={{ marginTop: '8px' }}>
                <Button type="text" onClick={showDrawer} icon={<MenuIcon />} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Layout.Header>
      <Drawer
        placement="right"
        width={'80vw'}
        closeIcon={
          <Button style={buttonStyle} onClick={onClose}>
            <MenuUnfoldOutlined />
          </Button>
        }
        style={{ background: '#F1F1F1' }}
        bodyStyle={{ padding: '0' }}
        extra={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              // padding: '12px 24px',
              lineHeight: '40px',
              alignItems: 'center',
              width: '100%',
              background: '#f0f2f5',
            }}
          >
            <div>
              <Link style={{ ...buttonStyle, color: '#1E1E1E' }} to='/settings' onClick={onClose}>
                <SettingOutlined />
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
                    <Button style={{ ...buttonStyle, marginLeft: '.5rem', marginRight: '.5rem' }}>
                      <AppstoreOutlined />
                    </Button>
                  </Popover>
                </>
              ) : null}
            </div>
            <AccountMenu />
          </div>
        }
        onClose={onClose}
        open={open}
      >
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
      </Drawer>
    </>
  );
}

export default MobileSidebar;
