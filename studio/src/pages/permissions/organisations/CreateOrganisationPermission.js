import React from 'react';
import OrganisationPermissionCreateForm from './components/PermissionForm';
import { useDispatch } from 'react-redux';
import { addOrganisationPermission } from '../../../actions/organisations';

import useNavigation from '../../../utils/useNavigation';

function CreateOrganisationPermission() {
  const history = useNavigation();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addOrganisationPermission(values)).then(() =>
      history('/admin/permissions/organisations'),
    );
  };
  return <OrganisationPermissionCreateForm onCreate={onCreate} />;
}

export default CreateOrganisationPermission;
