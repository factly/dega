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
