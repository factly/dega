import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Popover, List, Avatar, Button } from 'antd';
import routes, { sidebarMenu } from '../../config/routesConfig';
import _ from 'lodash';
import { setCollapse } from './../../actions/sidebar';
import SpaceSelector from './SpaceSelector';
import AccountMenu from './AccountMenu';
import { AppstoreOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import Search from '../Search';
import { maker } from '../../utils/sluger';

const { Sider } = Layout;
const { SubMenu } = Menu;

function Sidebar({ superOrg, permission, orgs, loading, applications }) {
  const { collapsed } = useSelector((state) => state.sidebar);
  const { space, loadingSpace } = useSelector((state) => {
    const currentSpaceID = orgs[0]?.spaces.find((id)=>id===state.spaces.selected)
    return {
      space: currentSpaceID ? state.spaces.details[currentSpaceID]: null,
      loadingSpace: state.spaces.loading
    }
  })

  let filteredMenuItems = [];
  if(!loadingSpace){
    if (space?.services?.length){
        filteredMenuItems = [...sidebarMenu.filter((menuItem)=>(menuItem.isService && space?.services?.indexOf(maker(menuItem.title)) > -1)), ...sidebarMenu.filter((menuItem) => !menuItem.isService)]
    }else{
        filteredMenuItems = [...sidebarMenu.filter((menuItem) => !menuItem.isService)]
    }
  }

  const dispatch = useDispatch();
  let key;
  const location = useLocation();
  const [enteredRoute, setRoute] = React.useState(null);
  const [selectedmenu, setSelectedMenu] = React.useState('Dashboard.Home.0.0');
  const pathSnippets = location.pathname.split('/').filter((i) => i);
  var index;
  for (index = 0; index < pathSnippets.length; index++) {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const tempRoute = _.find(routes, { path: url });
    if (tempRoute && enteredRoute === null) {
      setRoute(tempRoute);
      break;
    }
  }
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
    borderRadius: '50px',
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
          <Menu.Item key={`${title}.${route.title}.${index}.${childIndex}`}>
            {
              ((key = `${title}.${route.title}.${index}.${childIndex}`),
              enteredRoute !== null && route.path === enteredRoute.path && selectedmenu !== key
                ? setSelectedMenu(key)
                : null)
            }
            <Link to={route.path}>
              <span>{route.title}</span>
            </Link>
          </Menu.Item>
        )
      ) : null;
    });

  return (
    <Sider
      breakpoint="xl"
      className="main-sidebar"
      width="256"
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
          flexDirection: collapsed ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: collapsed ? '0 0.5rem' : '0 24px',
        }}
      >
        <Link to="/">
          <div className="menu-header" style={{}}>
            <SpaceSelector collapsed={collapsed} />
          </div>
        </Link>
        <Search collapsed={collapsed} />
      </div>

      <Menu
        theme={navTheme}
        mode="inline"
        className="slider-menu"
        defaultOpenKeys={['0', '1']}
        style={{ background: '#f0f2f5' }}
        defaultSelectedKeys={[selectedmenu]}
      >
        {filteredMenuItems.map((menu, index) => {
          const { Icon } = menu;
          return menu.title === 'CORE' && !showCoreMenu ? null : (
            <SubMenu key={index} title={menu.title} icon={<Icon />}>
              {menu.submenu && menu.submenu.length > 0 ? (
                <>
                  {menu.submenu.map((submenuItem, index) => {
                    return (
                      // check with Harsha on roles and permissions
                      orgs[0]?.permission.role === 'owner' ? (
                        <SubMenu key={submenuItem.title + index} title={submenuItem.title}>
                          {getMenuItems(submenuItem.children, index, submenuItem.title)}
                        </SubMenu>
                      ) : (
                        <SubMenu key={submenuItem.title + index} title={submenuItem.title}>
                          {getMenuItems(submenuItem.children, index, submenuItem.title)}
                        </SubMenu>
                      )
                    );
                  })}
                </>
              ) : null}
              {getMenuItems(menu.children, index, menu.title)}
            </SubMenu>
          );
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
                  <Button style={buttonStyle}>
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
