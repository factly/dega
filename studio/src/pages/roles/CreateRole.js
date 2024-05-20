import React from 'react';
import { createRole } from '../../actions/roles';
import { useDispatch } from 'react-redux';
 
import { Helmet } from 'react-helmet';
import RoleCreateForm from './components/RoleForm';
import useNavigation from '../../utils/useNavigation';

function CreateRole() {
  const history = useNavigation();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createRole(values)).then(() => history('/settings/members/roles'));
  };

  return (
    <>
      <Helmet title={'Create Role'} />
      <RoleCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateRole;
