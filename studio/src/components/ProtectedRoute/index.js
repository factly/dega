import React from 'react';
import { Link } from 'react-router-dom';
import { Result, Button } from 'antd';
import getUserPermission from '../../utils/getUserPermission';
import { useSelector } from 'react-redux';

function ProtectedRoute({ component: Component, permission, isOwner, ...rest }) {
  const spaces = useSelector((state) => {
    return state.spaces;
  });
  const actions = getUserPermission({ ...permission, spaces });
  const { loading, orgs, selected } = spaces;

  if (loading) {
    return () => null;
  }

  if (!loading && orgs.length === 0)
    return (
      <Result
        title="You do not have any organisation."
        subTitle="Sorry, you are not authorized to access this page. Please contact your administrator."
      />
    );

  if (
    !loading &&
    permission.isSpace &&
    selected === 0 &&
    orgs.filter((each) => each.role === 'admin').length > 0
  ) {
    return <Component {...rest} permission={{ actions }} />;
  }
  if (
    !loading &&
    isOwner &&
    selected === 0 &&
    orgs.filter((each) => each.role === 'admin').length > 0
  )
    return <Component {...rest} permission={{ actions }} />;

  if (
    !loading &&
    permission.isSpace &&
    selected > 0 &&
    orgs.filter((each) => each.role === 'admin').length > 0
  ) {
    return <Component {...rest} permission={{ actions }} />;
  }
  if (actions.length > 0) return <Component {...rest} permission={{ actions }} />;

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

export default ProtectedRoute;
