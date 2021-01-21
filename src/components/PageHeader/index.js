import React, { useMemo } from 'react';
import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import { PageHeader as AntPageHeader } from 'antd';
import routes from '../../config/routesConfig';
import _ from 'lodash';

function PageHeader() {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter((i) => i);
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
          const generatedReferenceURL = `/${pathSnippets.slice(0, index - 1).join('/')}`
            .concat('/:id/')
            .concat(pathSnippets.slice(index, index + 2).join('/'));
          let match = useRouteMatch(generatedReferenceURL);
          if (match) {
            const route = _.find(routes, { path: generatedReferenceURL });
            if (route) {
              return {
                path: route.path,
                breadcrumbName: route.title,
              };
            }
          }
        }
        return null;
      }
    });
    return [
      {
        path: '/',
        breadcrumbName: 'Home',
      },
    ].concat(_.filter(urlBreadcrumbItems));
  }, [pathSnippets]);

  const lastItem = useMemo(() => {
    return (
      _.find(routes, { path: breadcrumbItems[breadcrumbItems.length - 1].path }) || {
        path: '/',
        breadcrumbName: 'Home',
      }
    );
  }, [breadcrumbItems]);

  const itemRender = (route, params, routes, paths) => {
    const last = routes.indexOf(route) === routes.length - 1;
    if (last) {
      return <span>{route.breadcrumbName}</span>;
    }
    return <Link to={route.path}>{route.breadcrumbName}</Link>;
  };

  return <AntPageHeader ghost={false} breadcrumb={{ itemRender, routes: breadcrumbItems }} />;
}

export default PageHeader;
