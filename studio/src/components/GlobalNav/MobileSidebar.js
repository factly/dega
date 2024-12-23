import React from 'react';
import { Avatar, Layout, Button, Row, Col, Drawer, Menu, Popover, List } from 'antd';
import degaImg from '../../assets/dega.png';
import { useSelector, useDispatch } from 'react-redux';
import { sidebarMenu } from '../../config/routesConfig';
import {
  AppstoreOutlined,
  DownOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import AccountMenu from './AccountMenu';
import { Link } from 'react-router-dom';
import Search from '../Search';
import { setSpaceSelectorPage } from './../../actions/spaceSelectorPage';
import MenuIcon from '../../assets/MenuIcon';
import SearchIcon from '../../assets/SearchIcon';

function MobileSidebar({ applications, menuKey }) {
  const { details, selected } = useSelector((state) => state.spaces);
  const { navTheme } = useSelector((state) => state.settings);
  const [open, setOpen] = React.useState(false);
  const dispatch = useDispatch();

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  let buttonStyle = {
    width: '40px',
    height: '40px',
    background: '#DCE4E7',
    borderRadius: '21px',
    padding: '.5rem 0.5rem',
  };

  const getMenuItems = (children) =>
    children.map((route) => (
      <Menu.Item key={route.menuKey}>
        <Link to={route.path} onClick={onClose}>
          <span>{route.title}</span>
        </Link>
      </Menu.Item>
    ));

  const { SubMenu } = Menu;
  const getSubMenuItems = (menu, index, Icon) => (
    <SubMenu
      key={index}
      title={menu.title}
      icon={<Icon style={{ color: '#000', fontSize: '15px', fontWeight: '700' }} />}
    >
      {menu.submenu && menu.submenu.length > 0 ? (
        <>
          {menu.submenu.map((submenuItem, index) => (
            <SubMenu key={submenuItem.title + index} title={submenuItem.title}>
              {getMenuItems(submenuItem.children)}
            </SubMenu>
          ))}
        </>
      ) : null}
      {getMenuItems(menu.children)}
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
              lineHeight: '40px',
              alignItems: 'center',
              width: '100%',
              background: '#f0f2f5',
            }}
          >
            <div>
              <Link style={{ ...buttonStyle, color: '#1E1E1E' }} to="/settings" onClick={onClose}>
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
            return getSubMenuItems(menu, index, Icon);
          })}
        </Menu>
      </Drawer>
    </>
  );
}

export default MobileSidebar;
