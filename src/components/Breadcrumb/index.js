import React from 'react';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb as AntBreadcrumb } from 'antd';

function Breadcrumb(props) {
  const { location, routes } = props;
  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    return (
      <AntBreadcrumb.Item key={url}>
        <Link to={url}>{routes[url]}</Link>
      </AntBreadcrumb.Item>
    );
  });
  const breadcrumbItems = [
    <AntBreadcrumb.Item key="home">
      <Link to="/">
        <HomeOutlined />
      </Link>
    </AntBreadcrumb.Item>,
  ].concat(extraBreadcrumbItems);

  return <AntBreadcrumb>{breadcrumbItems}</AntBreadcrumb>;
}

export default Breadcrumb;
