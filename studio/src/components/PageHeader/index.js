import React, { useMemo } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import { PageHeader as AntPageHeader } from '@ant-design/pro-layout';
import routes from '../../config/routesConfig';
import _ from 'lodash';
import { matchPath } from 'react-router';
import { useSelector } from 'react-redux';
import './index.css';

function Pageheader() {
  const state = useSelector((state) => state);
  const location = useLocation();
  const history = useHistory();
  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const entity =
    pathSnippets[0] === 'fact-checks'
      ? 'posts'
      : (pathSnippets[0] === 'website' && pathSnippets[1] === 'menus') ||
        (pathSnippets[0] === 'advanced' && pathSnippets[1] === 'formats') ||
        (pathSnippets[0] === 'admin' && pathSnippets[1] === 'events') ||
        (pathSnippets[0] === 'advanced' && pathSnippets[1] === 'webhooks')
      ? pathSnippets[1]
      : pathSnippets[0];

  const isBreadCrumbsHidden =
    (pathSnippets.includes('edit') || pathSnippets.includes('create')) &&
    (entity === 'posts' || entity === 'pages' || entity === 'fact-checks'); // redundant entity check for fact-checks?
  const breadcrumbItems = useMemo(() => {
    const urlBreadcrumbItems = pathSnippets.map((empty, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const route = _.find(routes, { path: url });
      if (route && !isBreadCrumbsHidden) {
        return {
          path: route.path,
          breadcrumbName: route.title,
        };
      } else {
        if (url === '/permissions' && !pathSnippets[index + 2])
          return { breadcrumbName: 'Permissions' };
        if (url === '/requests' && !pathSnippets[index + 2]) return { breadcrumbName: 'Requests' };
        if (url === '/spaces' && !pathSnippets[index + 2]) return { breadcrumbName: 'Spaces' };
        if (
          index === pathSnippets.length - 1 &&
          !(
            location.pathname.includes('permissions') ||
            location.pathname.includes('requests') ||
            location.pathname.includes('spaces') ||
            location.pathname.includes('members')
          )
        ) {
          if (pathSnippets.includes('edit') && !state[entity].loading) {
            const generatedReferenceURL = `/${pathSnippets.slice(0, index - 1).join('/')}`
              .concat('/:id/')
              .concat(pathSnippets.slice(index, index + 2).join('/'));
            let match = matchPath(location.pathname, {
              path: generatedReferenceURL,
              exact: true,
              strict: false,
            });
            if (match) {
              const route = _.find(routes, { path: generatedReferenceURL });
              if (route) {
                const entityId = pathSnippets[index - 1];
                if (!state[entity].details[pathSnippets[index - 1]]) {
                  return null;
                } else {
                  return {
                    path: route.path,
                    breadcrumbName:
                      state[entity].details[entityId]?.name ||
                      state[entity].details[entityId]?.title ||
                      state[entity].details[entityId]?.claim,
                  };
                }
              }
            }
          }
        }
        if (isBreadCrumbsHidden) {
          return null;
        }
        return null;
      }
    });
    return _.filter(urlBreadcrumbItems);
  }, [pathSnippets, location.pathname]);

  const handleOnBack = () => {
    if (isBreadCrumbsHidden) {
      if (
        ['posts', 'fact-checks', 'pages'].includes(pathSnippets[0]) &&
        pathSnippets[2] === 'edit'
      ) {
        history.push('/' + pathSnippets[0]);
        return;
      }
      window.history.back();
    }
    return null;
  };
  const getTitle = (entityType) => {
    switch (entityType) {
      case 'fact-checks':
        return 'Fact-Checks';
      case 'posts':
        return 'Posts';
      case 'pages':
        return 'Pages';
      default:
        return;
    }
  };
  const itemRender = (route, params, routes, paths) => {
    const last = routes.indexOf(route) === routes.length - 1;
    if (last && routes.length > 1) {
      return (
        !isBreadCrumbsHidden && (
          <h2 style={{ display: 'inline', color: '#000000d9' }}>{route.breadcrumbName}</h2>
        )
      );
    }
    return (
      !isBreadCrumbsHidden && (
        <h2 style={{ display: 'inline' }}>
          <Link style={routes.length === 1 ? { color: '#000000d9' } : null} to={route.path}>
            {route.breadcrumbName}
          </Link>
        </h2>
      )
    );
  };

  if (
    (state[entity] && !state[entity].loading) ||
    ['members', 'advanced', 'website', 'admin'].includes(entity) ||
    location.pathname.split('/').pop() === 'create'
  )
    return (
      <AntPageHeader
        backIcon={isBreadCrumbsHidden ? <LeftOutlined /> : null}
        ghost={false}
        title={isBreadCrumbsHidden ? getTitle(pathSnippets[0]) : null}
        onBack={handleOnBack}
        breadcrumb={{
          itemRender,
          routes: breadcrumbItems,
          separator: <h2 style={{ display: 'inline', color: 'inherit' }}>&gt;</h2>,
        }}
      />
    );
  else return null;
}

export default Pageheader;
