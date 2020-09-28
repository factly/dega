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

  const permission = useSelector((state) => {
    const { selected } = state.spaces;

    if (selected > 0) {
      return state.spaces.details[selected].permissions;
    }
    return;
  });

  if (!permission) {
    return null;
  }

  const resource = ['dashboard', 'analytics', 'googleFactCheck', 'factly', 'posts', 'policies'];

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
                return resource.includes(route.resource) || resource.includes('admin') ? (
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
