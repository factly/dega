import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import logo from '../../assets/logo.svg';
import { toggleSider } from '../../actions/settings';
import routes from '../../config/routesConfig';

const { Sider } = Layout;

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
      <div className="menu-header">
        <img alt="logo" className="menu-logo" src={logo} />
        <span hidden={collapsed} className="menu-company">
          {title}
        </span>
      </div>
      <Menu theme={navTheme} mode="inline" className="slider-menu">
        {routes
          .filter((each) => each.enableNavigation)
          .map((route, index) => {
            const { Icon } = route;
            return (
              <Menu.Item key={index}>
                <Link to={route.path}>
                  <Icon></Icon>
                  <span>{route.title}</span>
                </Link>
              </Menu.Item>
            );
          })}
      </Menu>
    </Sider>
  );
}

export default Sidebar;
