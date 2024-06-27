import React from 'react';
import SpacePermissionEditForm from './components/PermissionForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateSpacePermission, getSpaces } from '../../../actions/spacePermissions';

import { useParams } from 'react-router-dom';
import RecordNotFound from '../../../components/ErrorsAndImage/RecordNotFound';
import useNavigation from '../../../utils/useNavigation';

function EditSpacePermission() {
  const history = useNavigation();
  const { sid, pid } = useParams();

  const dispatch = useDispatch();

  const { space, loading } = useSelector((state) => {
    return {
      space: state.spacePermissions.details[sid] ? state.spacePermissions.details[sid] : null,
      loading: state.spaces.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getSpaces());
  }, [dispatch, sid, pid]);

  if (!space) {
    return <RecordNotFound />;
  }

  const onUpdate = (values) => {
    dispatch(updateSpacePermission({ ...space.permission, ...values })).then(() =>
      history('/admin/permissions/spaces'),
    );
  };
  if (space) {
    return <SpacePermissionEditForm data={space.permission} onCreate={onUpdate} />;
  }
  if (loading) return <Skeleton />;
}

export default EditSpacePermission;
