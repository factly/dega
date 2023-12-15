import React from 'react';
import OrganisationRequestCreateForm from './components/RequestForm';
import { useDispatch } from 'react-redux';
import { addOrganisationRequest } from '../../../actions/organisationRequests';
 
import { Helmet } from 'react-helmet';
import useNavigation from '../../../utils/useNavigation';

function CreateOrganisationRequest() {
  const history = useNavigation();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addOrganisationRequest(values)).then(() =>
      history('/admin/requests/organisations'),
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
