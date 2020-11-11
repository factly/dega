import React from 'react';
import { Link, Route } from 'react-router-dom';
import { Result, Button } from 'antd';
import getUserPermission from '../../utils/getUserPermission';
import { useSelector } from 'react-redux';

function ProtectedRoute({ component: Component, permission, ...rest }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ ...permission, spaces });
  const { loading, orgs, selected } = spaces;

  if (loading) {
    return <Route {...rest} render={() => null} />;
  }

  if (!loading && orgs.length === 0)
    return (
      <Route
        {...rest}
        render={() => (
          <Result
            title="You do not have any organisation."
            subTitle="Sorry, you are not authorized to access this page."
            extra={
              <a href={`${process.env.REACT_APP_KAVACH_PUBLIC_URL}/settings`}>
                <Button type="primary">Back to Kavach</Button>
              </a>
            }
          />
        )}
      />
    );

  if (!loading && permission.isSpace && selected === 0 && orgs[0].permission.role === 'owner') {
    return (
      <Route
        {...rest}
        render={(props) => <Component {...rest} {...props} permission={{ actions }} />}
      />
    );
  }
  if (actions.length > 0)
    return (
      <Route
        {...rest}
        render={(props) => <Component {...rest} {...props} permission={{ actions }} />}
      />
    );

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

export default ProtectedRoute;
