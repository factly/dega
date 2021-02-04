import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import routes, { sidebarMenu } from '../../config/routesConfig';
import _ from 'lodash';
import { setCollapse } from './../../actions/sidebar';

const { Sider } = Layout;
const { SubMenu } = Menu;

function Sidebar({ superOrg, permission, orgs, loading }) {
  const { collapsed } = useSelector((state) => state.sidebar);
  const dispatch = useDispatch();

  let key;
  const location = useLocation();
  const [enteredRoute, setRoute] = React.useState(null);
  const [selectedmenu, setSelectedMenu] = React.useState('DASHBOARD.Home.0.0');
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

  let protectedResouces = [
    'posts',
    'categories',
    'tags',
    'media',
    'formats',
    'claims',
    'claimants',
    'ratings',
    'organisations',
    'menu',
    'fact check',
  ];

  permission.forEach((each) => {
    if (each.resource === 'admin') {
      resource = resource.concat(protectedResouces);
      if (!showCoreMenu) {
        setCoreMenu(true);
      }
    } else {
      if (!showCoreMenu && protectedResouces.includes(each.resource)) {
        setCoreMenu(true);
      }
      resource.push(each.resource);
    }
  });

  if (orgs[0]?.permission.role === 'owner') resource = resource.concat(protectedResouces);

  const getMenuItems = (children, index, title) =>
    children.map((route, childIndex) => {
      return resource.includes(route.title.toLowerCase()) ? (
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
      ) : null;
    });

  return (
    <Sider
      breakpoint="lg"
      width="256"
      theme={navTheme}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      style={{ position: 'sticky', left: 0, top: 0, overflow: 'auto', height: '100vh' }}
    >
      <Link to="/">
        <div className="menu-header" style={{ backgroundColor: '#1890ff' }}>
          <img
            alt="logo"
            hidden={!collapsed}
            className="menu-logo"
            src={require('../../assets/dega.png')}
          />
          <img
            alt="logo"
            hidden={collapsed}
            src={'https://degacms.com/img/dega.svg'}
            style={{ width: '40%' }}
          />
        </div>
      </Link>
      <Menu
        theme={navTheme}
        mode="inline"
        className="slider-menu"
        defaultOpenKeys={['0', '1']}
        defaultSelectedKeys={[selectedmenu]}
      >
        {sidebarMenu.map((menu, index) => {
          const { Icon } = menu;
          return menu.title === 'CORE' && !showCoreMenu ? null : (
            <SubMenu key={index} title={menu.title} icon={<Icon />}>
              {menu.submenu && menu.submenu.length > 0 ? (
                <>
                  {menu.submenu[0].isAdmin === superOrg.is_admin &&
                  orgs[0]?.permission.role === 'owner' ? (
                    <SubMenu key={menu.submenu[0].title + index} title={menu.submenu[0].title}>
                      {getMenuItems(menu.submenu[0].children, index, menu.submenu[0].title)}
                    </SubMenu>
                  ) : null}
                  {orgs[0]?.permission.role === 'owner' ? (
                    <SubMenu key={menu.submenu[1].title + index} title={menu.submenu[1].title}>
                      {getMenuItems(menu.submenu[1].children, index, menu.submenu[1].title)}
                    </SubMenu>
                  ) : null}
                </>
              ) : null}
              {getMenuItems(menu.children, index, menu.title)}
            </SubMenu>
          );
        })}
      </Menu>
    </Sider>
  );
}

export default Sidebar;
