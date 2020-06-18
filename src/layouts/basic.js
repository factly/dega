import React from 'react';
import { Layout, Card, Skeleton } from 'antd';
import { withRouter, useHistory } from 'react-router-dom';
import Sidebar from '../components/GlobalNav/Sidebar';
import Header from '../components/GlobalNav/Header';
import PageHeader from '../components/PageHeader';
import { useDispatch, useSelector } from 'react-redux';
import { getSpaces } from '../actions/spaces';
import './basic.css';

function BasicLayout(props) {
  const { location } = props;
  const history = useHistory();
  const { Footer, Content } = Layout;
  const { children } = props;
  const dispatch = useDispatch();
  const { selected, orgs } = useSelector((state) => state.spaces);

  React.useEffect(() => {
    dispatch(getSpaces());
  }, [dispatch]);

  React.useEffect(() => {
    if (orgs.length > 0 && selected === 0) history.push('/spaces/create');
  }, [orgs, location.pathname]);

  return (
    <Layout hasSider={true}>
      <Sidebar />
      <Layout>
        <Header />
        <Content className="layout-content">
          <PageHeader location={location} />
          {selected > 0 ||
          location.pathname === '/spaces' ||
          location.pathname === '/spaces/create' ? (
            <Card className="wrap-children-content">{children}</Card>
          ) : (
            <Skeleton />
          )}
        </Content>
        <Footer>Footer</Footer>
      </Layout>
    </Layout>
  );
}

export default withRouter(BasicLayout);
