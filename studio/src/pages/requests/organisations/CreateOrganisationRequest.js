import React from 'react';
import OrganisationRequestCreateForm from './components/RequestForm';
import { useDispatch } from 'react-redux';
import { addOrganisationRequest } from '../../../actions/organisationRequests';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function CreateOrganisationRequest() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addOrganisationRequest(values)).then(() =>
      history.push('/admin/requests/organisations'),
    );
  };
  return (
    <>
      <Helmet title={'Create Organisation Request'} />
      <OrganisationRequestCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateOrganisationRequest;
