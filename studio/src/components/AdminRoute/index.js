import React from 'react';
import { Link } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useSelector } from 'react-redux';

function AdminRoute({ component: Component, ...rest }) {
  const { loading, org, isOwner } = useSelector(({ admin, spaces }) => {
    let orgs = spaces.orgs.filter((each) => each.role === 'admin');

    return {
      loading: false,
      org: admin.organisation,
      isOwner: orgs.length > 0,
    };
  });

  if (loading) {
    return () => null;
  }

  if (!loading && !org)
    return (
      <Result
        title="You do not have any organisation."
        subTitle="Sorry, you are not authorized to access this page. Please contact your organisation admin."
      />
    );

  if (!loading && org.is_admin && isOwner) {
    return <Component {...rest} />;
  }

  return (
    <Result
      status="403"
      title="401"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Link to="/">
          <Button type="primary">Back Home</Button>
        </Link>
      }
    />
  );
}

export default AdminRoute;
