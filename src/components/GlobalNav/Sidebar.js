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
    title,
    navTheme,
  } = useSelector((state) => state.settings);
  const dispatch = useDispatch();
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
        {sidebarMenu.map((menu, index) => (
          <Menu.ItemGroup key={index} title={menu.title}>
            <Menu.Divider style={{ width: '90%', margin: 'auto' }} />
            {menu.children.map((route, childIndex) => {
              const { Icon } = route;
              return (
                <Menu.Item key={`${index}.${childIndex}`} icon={<Icon />}>
                  <Link to={route.path}>
                    <span>{route.title}</span>
                  </Link>
                </Menu.Item>
              );
            })}
            {menu.subChildren ? (
              <Menu.ItemGroup key={menu.subChildren.title} title={menu.subChildren.title}>
                <Menu.Divider style={{ width: '90%', margin: 'auto' }} />
                {menu.subChildren.routes.map((route, childIndex) => {
                  const { Icon } = route;
                  return (
                    <Menu.Item key={`${index}.${childIndex}.${childIndex}`} icon={<Icon />}>
                      <Link to={route.path}>
                        <span>{route.title}</span>
                      </Link>
                    </Menu.Item>
                  );
                })}
              </Menu.ItemGroup>
            ) : null}
          </Menu.ItemGroup>
        ))}
      </Menu>
    </Sider>
  );
}

export default Sidebar;
