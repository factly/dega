import React from 'react';
import SpacePermissionCreateForm from './components/PermissionForm';
import { useDispatch } from 'react-redux';
import { addSpacePermission } from '../../../actions/spacePermissions';

import useNavigation from '../../../utils/useNavigation';

function CreateSpacePermission() {
  const history = useNavigation();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addSpacePermission(values)).then(() => history('/admin/permissions/spaces'));
  };
  return <SpacePermissionCreateForm onCreate={onCreate} />;
}

export default CreateSpacePermission;
