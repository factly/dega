import React from 'react';
import { useSelector } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import { Result, Button } from 'antd';

function ProtectedRoute({ component: Component, permission: permission, ...rest }) {
  const { resource, action } = permission;
  const userPermission = useSelector(({ spaces }) => {
    const { selected, details } = spaces;
    return details[selected] ? details[selected].permissions : [];
  });

  if (
    userPermission.findIndex(
      (each) =>
        each.resource === 'admin' || (each.resource === resource && each.actions.includes(action)),
    ) > -1
  )
    return <Route {...rest} render={(props) => <Component {...rest} {...props} />} />;

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
