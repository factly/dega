import React from 'react';
import { Layout, Space } from 'antd';
import { withRouter } from 'react-router-dom';
import Sidebar from '../components/GlobalNav/Sidebar';
import Header from '../components/GlobalNav/Header';
import './basic.css';
import { useSelector } from 'react-redux';
import Breadcrumb from '../components/Breadcrumb';
function BasicLayout(props) {
  const { location } = props;
  const { Footer, Content } = Layout;
  const { children } = props;
  const { navTheme, routes } = useSelector((state) => state.settings);

  return (
    <Layout hasSider={true}>
      <Sidebar navTheme={navTheme} />
      <Layout>
        <Header />
        <Content className="layout-content">
          <Space direction="vertical">
            <Breadcrumb routes={routes} location={location} />
            {children}
          </Space>
        </Content>
        <Footer>Footer</Footer>
      </Layout>
    </Layout>
  );
}

export default withRouter(BasicLayout);
