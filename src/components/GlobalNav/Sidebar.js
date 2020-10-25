import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { toggleSider } from '../../actions/settings';
import { sidebarMenu } from '../../config/routesConfig';

const { Sider } = Layout;
const { SubMenu } = Menu;

function Sidebar() {
  const {
    sider: { collapsed },
    navTheme,
  } = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  const { permission, orgs, loading } = useSelector((state) => {
    const { selected, orgs, loading } = state.spaces;

    if (selected > 0) {
      return {
        permission: state.spaces.details[selected].permissions || [],
        orgs: orgs,
        loading: loading,
      };
    }
    return { orgs: orgs, loading: loading, permission: [] };
  });

  if (loading) {
    return null;
  }

  let resource = [
    'home',
    'dashboard',
    'analytics',
    'googlefactcheck',
    'factly',
    'posts',
    'policies',
    'users',
  ];

  permission.forEach((each) => {
    resource.push(each.resource);
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
      <div className="menu-header" style={{ backgroundColor: '#1890ff' }}>
        <img alt="logo" src={'https://degacms.com/img/dega.svg'} style={{ width: '40%' }} />
      </div>
      <Menu theme={navTheme} mode="inline" className="slider-menu">
        {sidebarMenu.map((menu, index) => {
          const { Icon } = menu;
          return (
            <SubMenu key={index} title={menu.title} icon={<Icon />}>
              {menu.children.map((route, childIndex) => {
                return resource.includes(route.title.toLowerCase()) ||
                  resource.includes('admin') ||
                  orgs[0].permission.role === 'owner' ? (
                  <Menu.Item key={`${index}.${childIndex}`}>
                    <Link to={route.path}>
                      <span>{route.title}</span>
                    </Link>
                  </Menu.Item>
                ) : null;
              })}
            </SubMenu>
          );
        })}
      </Menu>
    </Sider>
  );
}

export default Sidebar;
