import React from 'react';
import { Layout, Row, Col } from 'antd';
import Sidebar from '../components/GlobalNav/Sidebar';
import Header from '../components/GlobalNav/Header';
import './basic.css';

import { LogoutOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

const mockVal = (str, repeat = 1) => ({
  value: str.repeat(repeat),
});

function BasicLayout(props) {
  const { Footer, Content } = Layout;
  const { children } = props;
  const { navTheme } = useSelector((state) => state.settings);

  return (
    <Layout hasSider={true}>
      <Sidebar navTheme={navTheme} />
      <Layout>
        <Header />
        <Content className="layout-content">{children}</Content>
        <Footer>Footer</Footer>
      </Layout>
    </Layout>
  );
}

export default BasicLayout;
