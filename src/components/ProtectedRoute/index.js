import React from 'react';
import { Link, Route } from 'react-router-dom';
import { Result, Button } from 'antd';
import getUserPermission from '../../utils/getUserPermission';

function ProtectedRoute({ component: Component, permission: permission, ...rest }) {
  const actions = getUserPermission(permission);

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
