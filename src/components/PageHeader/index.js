import React, { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { PageHeader as AntPageHeader } from 'antd';
import routes from '../../config/routesConfig';
import _ from 'lodash';

function PageHeader(props) {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter((i) => i);
  // let { ...params } = useParams();
  // params = Object.keys(params);

  // _.reverse(pathSnippets).splice(0, params.length, ...params)
  // _.reverse(pathSnippets);
  // console.log('breadcrumbItems', pathSnippets, params);

  const breadcrumbItems = useMemo(() => {
    const urlBreadcrumbItems = pathSnippets.map((empty, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;

      console.log(url, location, 'breadcrumbItems');
      const route = _.find(routes, { path: url });

      if (route) {
        return {
          path: route.path,
          breadcrumbName: route.title,
        };
      } else {
      }
    });
    return [
      {
        path: '/',
        breadcrumbName: 'Home',
      },
    ].concat(_.filter(urlBreadcrumbItems));
  }, [location, pathSnippets]);

  const lastItem = useMemo(() => {
    return _.find(routes, { path: breadcrumbItems[breadcrumbItems.length - 1].path });
  }, [breadcrumbItems]);

  const itemRender = (route, params, routes, paths) => {
    const last = routes.indexOf(route) === routes.length - 1;
    if (last) {
      return <span>{route.breadcrumbName}</span>;
    }
    return <Link to={route.path}>{route.breadcrumbName}</Link>;
  };

  console.log('pathSnippets', lastItem, breadcrumbItems);

  return (
    <AntPageHeader
      className="site-page-header"
      title={lastItem.title}
      breadcrumb={{ itemRender, routes: breadcrumbItems }}
    />
  );
}

export default PageHeader;
