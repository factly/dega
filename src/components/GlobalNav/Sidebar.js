import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import logo from '../../assets/logo.svg';
import { PieChartOutlined, UserOutlined, ContainerOutlined } from '@ant-design/icons';
import { toggleSider } from '../../actions/settings';
const { Sider } = Layout;

function Sidebar({ navTheme }) {
  const { SubMenu } = Menu;
  const {
    sider: { collapsed },
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
          DEGA
        </span>
      </div>
      <Menu theme={navTheme} mode="inline" className="slider-menu">
        <Menu.Item key="1">
          <Link to="/dashboard">
            <PieChartOutlined />
            <span>Dashboard</span>
          </Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/spaces">
            <UserOutlined />
            <span>Spaces</span>
          </Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link to="/tags">
            <UserOutlined />
            <span>Tags</span>
          </Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}

export default Sidebar;
