import React from 'react';
import SpaceRequestCreateForm from './components/RequestForm';
import { useDispatch } from 'react-redux';
import { addSpaceRequest } from '../../../actions/spaceRequests';
import { useHistory } from 'react-router-dom';

function CreateSpaceRequest() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addSpaceRequest(values)).then(() => history.push('/requests/spaces'));
  };
  return <SpaceRequestCreateForm onCreate={onCreate} />;
}

export default CreateSpaceRequest;
