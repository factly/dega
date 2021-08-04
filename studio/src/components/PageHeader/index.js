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

  const breadcrumbItems = useMemo(() => {
    const urlBreadcrumbItems = pathSnippets.map((empty, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const route = _.find(routes, { path: url });
      if (route) {
        return {
          path: route.path,
          breadcrumbName: route.title,
        };
      } else {
        if (url === '/permissions' && !pathSnippets[index + 2])
          return { breadcrumbName: 'Permissions' };
        if (url === '/requests' && !pathSnippets[index + 2]) return { breadcrumbName: 'Requests' };
        if (
          index === pathSnippets.length - 1 &&
          !(location.pathname.includes('permissions') || location.pathname.includes('requests'))
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
        return null;
      }
    });
    return _.filter(urlBreadcrumbItems);
  }, [pathSnippets, location.pathname]);

  const itemRender = (route, params, routes, paths) => {
    const last = routes.indexOf(route) === routes.length - 1;
    if (last) {
      return <span>{route.breadcrumbName}</span>;
    }
    return <Link to={route.path}>{route.breadcrumbName}</Link>;
  };
  if (
    (pathSnippets.includes('edit') || pathSnippets.includes('create')) &&
    (entity === 'posts' || entity === 'pages' || entity === 'fact-checks')
  )
    return null;
  else if (state[entity] && !state[entity].loading)
    return (
      <h2>
        <AntPageHeader ghost={false} breadcrumb={{ itemRender, routes: breadcrumbItems }} />
      </h2>
    );
  else return null;
}

export default PageHeader;
