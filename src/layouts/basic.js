import React from 'react';
import { Layout, Card, notification } from 'antd';
import { withRouter, useHistory } from 'react-router-dom';
import Sidebar from '../components/GlobalNav/Sidebar';
import Header from '../components/GlobalNav/Header';
import { useDispatch, useSelector } from 'react-redux';
import { getSpaces } from '../actions/spaces';
import './basic.css';
import { getSuperOrganisation } from '../actions/admin';

function BasicLayout(props) {
  const { location } = props;
  const history = useHistory();
  const { Footer, Content } = Layout;
  const { children } = props;
  const dispatch = useDispatch();
  const { selected, orgs } = useSelector((state) => state.spaces);
  const { type, message, description } = useSelector((state) => state.notifications);

  React.useEffect(() => {
    dispatch(getSpaces()).then((org) => {
      dispatch(getSuperOrganisation(org[0].id));
    });
  }, [dispatch]);

  React.useEffect(() => {
    if (type && message && description) {
      notification[type]({
        message: message,
        description: description,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description]);

  React.useEffect(() => {
    if (orgs.length > 0 && selected === 0) history.push('/spaces/create');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgs, location.pathname]);

  return (
    <Layout hasSider={true}>
      <Sidebar />
      <Layout>
        <Header />
        <Content className="layout-content">
          <Card key={selected.toString()} className="wrap-children-content">
            {children}
          </Card>
        </Content>
        <Footer>Footer</Footer>
      </Layout>
    </Layout>
  );
}

export default withRouter(BasicLayout);
