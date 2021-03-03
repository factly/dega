import React from 'react';
import { Layout, Card, notification } from 'antd';
import { withRouter, useHistory } from 'react-router-dom';
import Sidebar from '../components/GlobalNav/Sidebar';
import Header from '../components/GlobalNav/Header';
import { useDispatch, useSelector } from 'react-redux';
import { getSpaces } from '../actions/spaces';
import './basic.css';
import { getSuperOrganisation } from '../actions/admin';
import PageHeader from '../components/PageHeader';

function BasicLayout(props) {
  const { location } = props;
  const history = useHistory();
  const { Footer, Content } = Layout;
  const { children } = props;
  const dispatch = useDispatch();

  const { permission, orgs, loading, selected, applications } = useSelector((state) => {
    const { selected, orgs, loading } = state.spaces;

    if (selected > 0) {
      const space = state.spaces.details[selected];

      const applications = orgs.find((org) => org.spaces.includes(space.id))?.applications || [];

      return {
        applications: applications,
        permission: space.permissions || [],
        orgs: orgs,
        loading: loading,
        selected: selected,
      };
    }
    return { orgs: orgs, loading: loading, permission: [], selected: selected, applications: [] };
  });

  const { type, message, description } = useSelector((state) => state.notifications);

  const superOrg = useSelector(({ admin }) => {
    return admin.organisation;
  });

  React.useEffect(() => {
    dispatch(getSpaces()).then((org) => {
      if (org && org.length > 0) dispatch(getSuperOrganisation(org[0].id));
    });
  }, [dispatch, selected]);

  React.useEffect(() => {
    if (type && message && description && selected !== 0) {
      notification[type]({
        message: message,
        description: description,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description]);

  // React.useEffect(() => {
  //   if (orgs.length > 0 && selected === 0) history.push('/spaces/create');
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [orgs, location.pathname]);

  return (
    <Layout hasSider={true}>
      <Sidebar permission={permission} orgs={orgs} loading={loading} superOrg={superOrg} />
      <Layout>
        <Header applications={applications} />
        <Content className="layout-content">
          <PageHeader location={location} />
          <Card key={selected.toString()} className="wrap-children-content">
            {children}
          </Card>
        </Content>
        <Footer style={{ textAlign: 'center' }}> ©2014-2020 Factly Media & Research</Footer>
      </Layout>
    </Layout>
  );
}

export default withRouter(BasicLayout);
