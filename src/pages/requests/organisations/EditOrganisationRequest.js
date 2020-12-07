import React from 'react';
import OrganisationRequestEditForm from './components/RequestForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateOrganisationRequest, getOrganisations } from '../../../actions/organisationRequests';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function EditOrganisationRequest() {
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
    dispatch(updateOrganisationRequest({ ...organisation.request, ...values })).then(() =>
      history.push('/requests/organisations'),
    );
  };

  return <OrganisationRequestEditForm data={organisation.request} onCreate={onUpdate} />;
}

export default EditOrganisationRequest;
