import React from 'react';
import { Layout, Card, notification, BackTop, ConfigProvider, Result } from 'antd';
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

function BasicLayout(props) {
  const [isMobileScreen, setIsMobileScreen] = React.useState(false);
  React.useEffect(() => {
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
  const location = useLocation();
  const { Content } = Layout;
  const { children } = props;
  const [enteredRoute, setRoute] = React.useState({ menuKey: '/' });
  React.useEffect(() => {
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

  const dispatch = useDispatch();

  const { permission, orgs, loading, selected, applications, services } = useSelector((state) => {
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
        services: space.services,
      };
    }
    return {
      orgs: orgs,
      loading: loading,
      permission: [],
      selected: selected,
      applications: [],
      services: ['core'],
    };
  });

  const { type, message, description, time, redirect } = useSelector((state) => {
    return { ...state.notifications, redirect: state.redirect };
  });

  React.useEffect(() => {
    dispatch(getSpaces());
  }, [dispatch, selected]);

  React.useEffect(() => {
    if (type && message && description && selected !== 0) {
      notification[type]({
        message: message,
        description: description,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, description]);

  React.useEffect(() => {
    if (redirect?.code === 307) {
      window.location.href = window.REACT_APP_KAVACH_PUBLIC_URL;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirect]);

  const spaceSelectorVisible = useSelector((state) => state.spaceSelectorPage);

  if (spaceSelectorVisible.visible) {
    return (
      <SpaceSelector
        open={spaceSelectorVisible.visible}
        onClose={() => dispatch(setSpaceSelectorPage(false))}
      />
    );
  }

  console.log('location.pathname', location.pathname);

  const hideSidebar =
    (location.pathname.includes('posts') ||
      location.pathname.includes('fact-checks') ||
      location.pathname.includes('pages')) &&
    (location.pathname.includes('edit') || location.pathname.includes('create'));

  const permissionRequirements = {
    '/posts': [
      { resource: 'categories', action: 'get' },
      { resource: 'tags', action: 'get' },
      { resource: 'posts', action: ['get', 'create'] },
    ],
    '/posts/create': [
      { resource: 'categories', action: 'get' },
      { resource: 'media', action: 'get' },
      { resource: 'tags', action: 'get' },
      { resource: 'posts', action: ['get', 'create'] },
    ],
    '/pages': [
      { resource: 'categories', action: 'get' },
      { resource: 'tags', action: 'get' },
      { resource: 'pages', action: ['get', 'create'] },
    ],
    '/pages/create': [
      { resource: 'categories', action: 'get' },
      { resource: 'media', action: 'get' },
      { resource: 'tags', action: 'get' },
      { resource: 'pages', action: ['get', 'create'] },
    ],
    '/fact-checks': [
      { resource: 'categories', action: 'get' },
      { resource: 'tags', action: 'get' },
      { resource: 'fact-checks', action: ['get', 'create'] },
    ],
    '/fact-checks/create': [
      { resource: 'categories', action: 'get' },
      { resource: 'tags', action: 'get' },
      { resource: 'media', action: 'get' },
      { resource: 'claims', action: 'get' },
      { resource: 'fact-checks', action: ['get', 'create'] },
    ],
    '/claims': [
      { resource: 'claimants', action: 'get' },
      { resource: 'ratings', action: 'get' },
      { resource: 'claims', action: ['get', 'create'] },
    ],
    '/claims/create': [
      { resource: 'claimants', action: 'get' },
      { resource: 'ratings', action: 'get' },
      { resource: 'claims', action: ['get', 'create'] },
    ],
    '/categories/create': [
      { resource: 'media', action: 'get' },
      { resource: 'categories', action: ['get', 'create'] },
    ],
    '/tags/create': [
      { resource: 'media', action: 'get' },
      { resource: 'tags', action: ['get', 'create'] },
    ],
    '/claimants/create': [
      { resource: 'media', action: 'get' },
      { resource: 'claimants', action: ['get', 'create'] },
    ],
    '/ratings/create': [
      { resource: 'media', action: 'get' },
      { resource: 'ratings', action: ['get', 'create'] },
    ],
  };

  function checkPermissions(pathname, selected, orgs, userPermission) {
    const requiredPermissions = permissionRequirements[pathname];

    // Check if userPermission includes 'admin' for any resource
    const isAdmin = userPermission.some((perm) => perm.resource === 'admin');

    // If user has 'admin' permission, allow access
    if (isAdmin) {
      return null;
    }

    // Otherwise, check if user has specific permissions for the current location
    const missingPermissions = requiredPermissions.filter((reqPerm) => {
      const matchingPerm = userPermission.find(
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
  const missingPermissions = checkPermissions(location.pathname, selected, orgs, permission);

  if (missingPermissions) {
    return (
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
      />
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
