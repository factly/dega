import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from 'antd';

function Breadcrumb({ path }) {
  let pathList = path.split('/').slice(1);

  const breadcrumbItems = pathList.map((each, index) => {
    let pathMaker = '';
    Array(index + 1)
      .fill()
      .forEach((each, index) => {
        pathMaker += pathList[index] + '/';
      });

    return {
      path: pathMaker,
      breadcrumbName: each.charAt(0).toUpperCase() + each.slice(1),
    };
  });

  const itemRender = (route, params, routes, paths) => {
    const last = routes.indexOf(route) === routes.length - 1;
    if (last && routes.length > 1) {
      return <h2 style={{ display: 'inline' }}>{route.breadcrumbName}</h2>;
    }
    return (
      <h2 style={{ display: 'inline' }}>
        <Link to={route.path}>{route.breadcrumbName}</Link>
      </h2>
    );
  };
  return (
    <PageHeader
      className="site-page-header"
      breadcrumb={{
        itemRender,
        routes: breadcrumbItems,
        separator: <h2 style={{ display: 'inline', color: 'inherit' }}>&gt;</h2>,
      }}
    />
  );
}

export default Breadcrumb;
