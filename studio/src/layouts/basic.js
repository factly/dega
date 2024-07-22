import { useState, useEffect } from 'react';
import { Layout, Card, notification, BackTop, ConfigProvider, Result, Button, Row, Col } from 'antd';
import SpaceSelector from '../components/GlobalNav/SpaceSelector';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Sidebar from '../components/GlobalNav/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { getSpaces } from '../actions/spaces';
import './basic.css';
import Pageheader from '../components/PageHeader';
import routes from '../config/routesConfig';
import _ from 'lodash';
import { setSpaceSelectorPage } from '../actions/spaceSelectorPage';
import MobileSidebar from '../components/GlobalNav/MobileSidebar';
import { permissionRequirements } from '../utils/getUserPermission';
import CreateSpace from '../pages/spaces/CreateSpace';
import '../components/PreviewSocialCard/style.css';



const styles = {
  position: 'absolute',
  padding: '2rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  width: '100%',
};

function BasicLayout(props) {
  const dispatch = useDispatch();
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const location = useLocation();
  const { Content } = Layout;
  const { children } = props;
  const [enteredRoute, setRoute] = useState({ menuKey: '/' });

  const {
    permission,
    orgs,
    loading,
    selected,
    applications,
    services,
    org_role,
    session,
  } = useSelector((state) => {
    const { selected, orgs, loading, org_role } = state.spaces;

    if (selected !== '') {
      const space = state.spaces.details[selected];

      const applications = orgs.find((org) => org.spaces.includes(space.id))?.applications || [];

      return {
        applications: applications,
        permission: space.permissions || [],
        orgs: orgs,
        loading: loading,
        selected: selected,
        services: space.services,
        org_role: space.org_role,
        session: state.session,
      };
    }
    return {
      orgs: orgs,
      loading: loading,
      permission: [],
      selected: selected,
      applications: [],
      services: ['core'],
      org_role,
      session: state.session,
    };
  });

  const { type, message, description, time } = useSelector((state) => {
    return { ...state.notifications };
  });

  const spaceSelectorVisible = useSelector((state) => state.spaceSelectorPage);

  useEffect(() => {
    const pathSnippets = location.pathname.split('/').filter((i) => i);
    if (pathSnippets.length === 0) {
      setRoute({ menuKey: '/' });
      return;
    }
    var index;
    for (index = 0; index < pathSnippets.length; index++) {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const nextTempRoute =
        pathSnippets.length - index > 1
          ? _.find(routes, { path: `/${pathSnippets.slice(0, index + 2).join('/')}` })
          : null;
      const tempRoute = _.find(routes, { path: url });
      if (nextTempRoute) {
        continue;
      }
      if (tempRoute) {
        setRoute(tempRoute);
        break;
      }
    }
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 460) {
        setIsMobileScreen(true);
      } else {
        setIsMobileScreen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (session.details && !session.loading) dispatch(getSpaces());
  }, [dispatch, selected, session]);

  useEffect(() => {
    if (type && message && description && selected !== 0) {
      notification[type]({
        message: message,
        description: description,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, description]);

  if (spaceSelectorVisible.visible) {
    return (
      <SpaceSelector
        open={spaceSelectorVisible.visible}
        onClose={() => dispatch(setSpaceSelectorPage(false))}
      />
    );
  }

  const hideSidebar =
    (location.pathname.includes('posts') ||
      location.pathname.includes('fact-checks') ||
      location.pathname.includes('pages')) &&
    (location.pathname.includes('edit') || location.pathname.includes('create'));

  function checkPermissions() {
    const requiredPermissions = permissionRequirements[location.pathname];

    if (!requiredPermissions) {
      return null;
    }

    // If user has 'admin' permission, allow access
    if (org_role === 'admin') {
      return null;
    }

    // Otherwise, check if user has specific permissions for the current location
    const missingPermissions = requiredPermissions.filter((reqPerm) => {
      const matchingPerm = permission.find(
        (perm) =>
          perm.resource === reqPerm.resource &&
          (Array.isArray(reqPerm.action)
            ? reqPerm.action.every((action) => perm.actions.includes(action))
            : perm.actions.includes(reqPerm.action)),
      );
      return !matchingPerm;
    });

    return missingPermissions.length > 0 ? missingPermissions : null;
  }
  // Render based on permission check
  const missingPermissions = checkPermissions();

  if (!loading && (!orgs.length || orgs.filter((o) => o.role === 'admin').length === 0)) {
    return (
      <div style={styles}>
        <Result
          status="401"
          title="403 Forbidden"
          subTitle="You don't have access. Please contact your administrator."
        />
      </div>
    );
  }

  if (missingPermissions) {
    return (
      <div style={styles}>
        <Result
          status="403"
          title="403 Forbidden"
          subTitle={`You don't have required permissions: ${missingPermissions
            .map(
              (perm) =>
                `${perm.resource} (${
                  Array.isArray(perm.action) ? perm.action.join(', ') : perm.action
                })`,
            )
            .join(', ')}`}
          extra={<Button href="/">Back Home</Button>}
        />
      </div>
    );
  }

  if (!loading && (!orgs.length || orgs.filter((o) => o.role === 'admin').length === 0)) {
    return (
      <div style={styles}>
        <Result
          status="403"
          title="403 Forbidden"
          subTitle="You don't have access. Please contact your administrator."
        />
      </div>
    );
  }

  const existingSpaces = orgs[0]?.spaces;

    if (!loading && existingSpaces?.length === 0) {
        return ( 
            <Row justify={"center"}>
              <Col>
              <h1 className="custom-heading">You do not have any space created,</h1>
              <h2 className="custom-heading">Please create a space to continue further.</h2>
              <CreateSpace />
              </Col>
            </Row>
        );
    }

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            colorItemBgSelected: '#0000000F',
            colorItemTextSelected: '#000',
            colorLink: '#000',
          },
          Table: {
            paddingContentVerticalLG: 12,
            colorTextHeading: '#475467',
            fontWeightStrong: 500,
            fontSize: 12,
          },
          Tabs: {
            margin: 10,
            colorText: '#6C6C6C',
          },
          Pagination: {
            colorPrimary: '#1E1E1E',
          },
          Modal: {
            colorBgMask: '#00000051',
          },
        },
      }}
    >
      {isMobileScreen && !hideSidebar && (
        <>
          <Layout style={{ padding: '48px 28px 17px 28px', background: '#F2F5F9' }}>
            <MobileSidebar
              permission={permission}
              menuKey={enteredRoute?.menuKey}
              orgs={orgs}
              loading={loading}
              applications={applications}
              services={services}
              org_role={org_role}
            />
          </Layout>
        </>
      )}
      <Layout hasSider={true}>
        <Helmet titleTemplate={'%s | Dega Studio'} title={'Dega Studio'} />
        {!isMobileScreen && !hideSidebar && (
          <Sidebar
            permission={permission}
            menuKey={enteredRoute?.menuKey}
            orgs={orgs}
            loading={loading}
            applications={applications}
            services={services}
            signOut={children.props.handleLogout}
            org_role={org_role}
          />
        )}
        <Layout style={{ background: '#fff' }}>
          <Content className="layout-content">
            {[
              '/posts',
              '/pages',
              '/categories',
              '/tags',
              '/media',
              '/fact-checks',
              '/claims',
              '/claimants',
              '/ratings',
              '/podcasts',
              '/episodes',
              '/settings',
            ].includes(location.pathname) || <Pageheader location={location} />}
            <Card key={selected.toString()} className="wrap-children-content">
              {children}
            </Card>
          </Content>
          <BackTop style={{ right: 50 }} />
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default BasicLayout;
