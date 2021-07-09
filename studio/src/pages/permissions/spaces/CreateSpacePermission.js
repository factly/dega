import React from 'react';
import SpacePermissionCreateForm from './components/PermissionForm';
import { useDispatch } from 'react-redux';
import { addSpacePermission } from '../../../actions/spacePermissions';
import { useHistory } from 'react-router-dom';

function CreateSpacePermission() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addSpacePermission(values)).then(() => history.push('/permissions/spaces'));
  };
  return <SpacePermissionCreateForm onCreate={onCreate} />;
}

export default CreateSpacePermission;
