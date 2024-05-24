import React from 'react';
import OrganisationPermissionEditForm from './components/PermissionForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateOrganisationPermission, getOrganisations } from '../../../actions/organisations';

import { useParams } from 'react-router-dom';
import RecordNotFound from '../../../components/ErrorsAndImage/RecordNotFound';
import useNavigation from '../../../utils/useNavigation';

function EditOrganisationPermission() {
  const history = useNavigation();
  const { oid, pid } = useParams();

  const dispatch = useDispatch();

  const { organisation, loading } = useSelector((state) => {
    return {
      organisation: state.organisations.details[oid] ? state.organisations.details[oid] : null,
      loading: state.organisations.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getOrganisations());
  }, [dispatch, oid, pid]);

  if (!organisation) {
    return <RecordNotFound />;
  }

  const onUpdate = (values) => {
    dispatch(updateOrganisationPermission({ ...organisation.permission, ...values })).then(() =>
      history('/admin/permissions/organisations'),
    );
  };
  if (organisation)
    return <OrganisationPermissionEditForm data={organisation.permission} onCreate={onUpdate} />;

  if (loading) return <Skeleton />;
}

export default EditOrganisationPermission;
