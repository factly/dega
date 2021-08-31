import React from 'react';
import OrganisationRequestCreateForm from './components/RequestForm';
import { useDispatch } from 'react-redux';
import { addOrganisationRequest } from '../../../actions/organisationRequests';
import { useHistory } from 'react-router-dom';

function CreateOrganisationRequest() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addOrganisationRequest(values)).then(() =>
      history.push('/admin/requests/organisations'),
    );
  };
  return <OrganisationRequestCreateForm onCreate={onCreate} />;
}

export default CreateOrganisationRequest;
