import React from 'react';
import { Link, Route } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useSelector } from 'react-redux';

function AdminRoute({ component: Component, ...rest }) {
  const { loading, org, isOwner } = useSelector(({ admin, spaces }) => {
    let orgs = spaces.orgs.filter((each) => each.permission.role === 'owner');

    return {
      loading: admin.loading,
      org: admin.organisation,
      isOwner: orgs.length > 0,
    };
  });

  if (loading) {
    return <Route {...rest} render={() => null} />;
  }

  if (!loading && !org)
    return (
      <Route
        {...rest}
        render={() => (
          <Result
            title="You do not have any organisation."
            subTitle="Sorry, you are not authorized to access this page."
            extra={
              <a href={`${window.REACT_APP_KAVACH_PUBLIC_URL}/settings`}>
                <Button type="primary">Back to Kavach</Button>
              </a>
            }
          />
        )}
      />
    );

  if (!loading && org.is_admin && isOwner) {
    return <Route {...rest} render={(props) => <Component {...rest} {...props} />} />;
  }

  return (
    <Route
      {...rest}
      render={() => (
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
      )}
    />
  );
}

export default AdminRoute;
