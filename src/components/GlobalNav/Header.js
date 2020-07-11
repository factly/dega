import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Space } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { toggleSider } from '../../actions/settings';
import AccountMenu from './AccountMenu';
import SpaceSelector from './SpaceSelector';
import Search from './Search';
function Header() {
  const collapsed = useSelector((state) => state.settings.sider.collapsed);
  const dispatch = useDispatch();
  const MenuFoldComponent = collapsed ? MenuUnfoldOutlined : MenuFoldOutlined;

  return (
    <Layout.Header className="layout-header">
      <Space direction="horizontal" size={48}>
        <MenuFoldComponent style={{ fontSize: '16px' }} onClick={() => dispatch(toggleSider())} />

        <SpaceSelector />

        <Search />

        <AccountMenu />
      </Space>
    </Layout.Header>
  );
}

export default Header;
