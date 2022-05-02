import React from 'react';
import SpaceRequestCreateForm from './components/RequestForm';
import { useDispatch } from 'react-redux';
import { addSpaceRequest } from '../../../actions/spaceRequests';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function CreateSpaceRequest() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addSpaceRequest(values)).then(() => history.push('/admin/requests/spaces'));
  };
  return (
    <>
      <Helmet title={'Create Space Request'} />
      <SpaceRequestCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateSpaceRequest;
