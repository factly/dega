import React from 'react';
import OrganisationPermissionCreateForm from './components/PermissionForm';
import { useDispatch } from 'react-redux';
import { addOrganisationPermission } from '../../../actions/organisations';
import { useHistory } from 'react-router-dom';

function CreateOrganisationPermission() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addOrganisationPermission(values)).then(() =>
      history.push('/permissions/organisations'),
    );
  };
  return <OrganisationPermissionCreateForm onCreate={onCreate} />;
}

export default CreateOrganisationPermission;
