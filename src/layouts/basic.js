import React, { useEffect } from 'react';
import { Layout, Card } from 'antd';
import { withRouter } from 'react-router-dom';
import Sidebar from '../components/GlobalNav/Sidebar';
import Header from '../components/GlobalNav/Header';
import PageHeader from '../components/PageHeader';
import { useDispatch } from 'react-redux';
import { getSpaces } from '../actions/spaces';
import './basic.css';

function BasicLayout(props) {
  const { location } = props;
  const { Footer, Content } = Layout;
  const { children } = props;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSpaces());
  }, [dispatch]);
  return (
    <Layout hasSider={true}>
      <Sidebar />
      <Layout>
        <Header />
        <Content className="layout-content">
          <PageHeader location={location} />
          <Card className="wrap-children-content">{children}</Card>
        </Content>
        <Footer>Footer</Footer>
      </Layout>
    </Layout>
  );
}

export default withRouter(BasicLayout);
