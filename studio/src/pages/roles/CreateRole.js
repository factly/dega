import React from 'react';
import { createRole } from '../../actions/roles';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import RoleCreateForm from './components/RoleForm';

function CreateRole() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    console.log(values, 'onCreate');
    // values.users = values.users.map((item) => item.toString());
    // values.permissions = values.permissions.filter(
    //   (item) => item && item.resource && item.actions.length > 0,
    // );
    dispatch(createRole(values)).then(() => history.push('/members/roles'));
  };

  return (
    <>
      <Helmet title={'Create Role'} />
      <RoleCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateRole;
