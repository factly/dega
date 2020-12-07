import React from 'react';
import OrganisationPermissionEditForm from './components/PermissionForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateOrganisationPermission, getOrganisations } from '../../../actions/organisations';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function EditOrganisationPermission() {
  const history = useHistory();
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

  if (loading && !organisation) return <Skeleton />;

  const onUpdate = (values) => {
    dispatch(updateOrganisationPermission({ ...organisation.permission, ...values })).then(() =>
      history.push('/permissions/organisations'),
    );
  };

  return <OrganisationPermissionEditForm data={organisation.permission} onCreate={onUpdate} />;
}

export default EditOrganisationPermission;
