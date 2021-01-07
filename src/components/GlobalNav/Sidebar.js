import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { toggleSider } from '../../actions/settings';
import { sidebarMenu } from '../../config/routesConfig';

const { Sider } = Layout;
const { SubMenu } = Menu;

function Sidebar({ superOrg, permission, orgs, loading }) {
  const {
    sider: { collapsed },
    navTheme,
  } = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  if (loading) {
    return null;
  }

  let resource = [
    'home',
    'dashboard',
    'analytics',
    'google',
    'factly',
    'posts',
    'policies',
    'users',
    'spaces',
  ];

  let protectedResouces = [
    'categories',
    'tags',
    'media',
    'formats',
    'claims',
    'claimants',
    'ratings',
    'organisations',
    'menu',
  ];

  permission.forEach((each) => {
    if (each.resource === 'admin') {
      resource = resource.concat(protectedResouces);
    } else {
      resource.push(each.resource);
    }
  });

  if (orgs[0]?.permission.role === 'owner') resource = resource.concat(protectedResouces);

  const getMenuItems = (children, index, title) =>
    children.map((route, childIndex) => {
      return resource.includes(route.title.toLowerCase()) ? (
        <Menu.Item key={`${title}.${route.title}.${index}.${childIndex}`}>
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
      trigger={null}
      onBreakpoint={(broken) => {
        dispatch(toggleSider());
      }}
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
      <Menu theme={navTheme} mode="inline" className="slider-menu">
        {sidebarMenu.map((menu, index) => {
          const { Icon } = menu;
          return (
            <SubMenu key={index} title={menu.title} icon={<Icon />}>
              {menu.submenu && menu.submenu.length > 0 ? (
                <>
                  {menu.submenu[0].isAdmin === superOrg.is_admin ? (
                    <SubMenu key={menu.submenu[0].title + index} title={menu.submenu[0].title}>
                      {getMenuItems(menu.submenu[0].children, index, menu.submenu[0].title)}
                    </SubMenu>
                  ) : null}
                  <SubMenu key={menu.submenu[1].title + index} title={menu.submenu[1].title}>
                    {getMenuItems(menu.submenu[1].children, index, menu.submenu[1].title)}
                  </SubMenu>
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
