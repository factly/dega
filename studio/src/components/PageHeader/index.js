import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PageHeader as AntPageHeader } from 'antd';
import routes from '../../config/routesConfig';
import _ from 'lodash';
import { matchPath } from 'react-router';
import { useSelector } from 'react-redux';

function PageHeader() {
  const state = useSelector((state) => state);
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const entity = pathSnippets[0] === 'fact-checks' ? 'posts' : pathSnippets[0];

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
        if (url === '/formats' && !pathSnippets[index + 2]) return { breadcrumbName: 'Formats' };
        if (url === '/menus' && !pathSnippets[index + 2]) return { breadcrumbName: 'Menus' };
        if (url === '/users' && !pathSnippets[index + 2]) return { breadcrumbName: 'Users' };
        if (url === '/webhooks' && !pathSnippets[index + 2]) return { breadcrumbName: 'Webhooks' };
        if (url === '/policies' && !pathSnippets[index + 2]) return { breadcrumbName: 'Policies' };
        if (
          index === pathSnippets.length - 1 &&
          !(
            location.pathname.includes('permissions') ||
            location.pathname.includes('requests') ||
            location.pathname.includes('spaces') ||
            location.pathname.includes('members') ||
            location.pathname.includes('formats') ||
            location.pathname.includes('menus') ||
            location.pathname.includes('webhooks') ||
            location.pathname.includes('policies') ||
            location.pathname.includes('users')
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
      return !isBreadCrumbsHidden && <h2 style={{ display: 'inline' }}>{route.breadcrumbName}</h2>;
    }
    return (
      !isBreadCrumbsHidden && (
        <h2 style={{ display: 'inline' }}>
          <Link to={route.path}>{route.breadcrumbName}</Link>
        </h2>
      )
    );
  };
  if (
    (state[entity] && !state[entity]?.loading) ||
    ['members', 'advanced', 'website', 'admin'].includes(entity)
  )
    return (
      <AntPageHeader
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

export default PageHeader;
