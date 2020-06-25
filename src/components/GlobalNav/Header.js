import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Divider, Space } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { toggleSider } from '../../actions/settings';
import AccountMenu from './AccountMenu';
import SpaceSelector from './SpaceSelector';
import Search from './Search';
function Header() {
  const { Header: HeaderAnt } = Layout;

  const collapsed = useSelector((state) => state.settings.sider.collapsed);
  const dispatch = useDispatch();
  const MenuFoldComponent = collapsed ? MenuUnfoldOutlined : MenuFoldOutlined;

  return (
    <HeaderAnt className="layout-header">
      <Space direction="horizontal">
        <MenuFoldComponent style={{ fontSize: '20px' }} onClick={() => dispatch(toggleSider())} />
        <Divider type="vertical" />
        <SpaceSelector />
        <Divider type="vertical" />
        <Search />
        <Divider type="vertical" />
        <AccountMenu />
      </Space>
    </HeaderAnt>
  );
}

export default Header;
