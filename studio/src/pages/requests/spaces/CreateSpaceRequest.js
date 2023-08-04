import React from 'react';
import SpaceRequestCreateForm from './components/RequestForm';
import { useDispatch } from 'react-redux';
import { addSpaceRequest } from '../../../actions/spaceRequests';
 
import { Helmet } from 'react-helmet';
import useNavigation from '../../../utils/useNavigation';

function CreateSpaceRequest() {
  const history = useNavigation();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addSpaceRequest(values)).then(() => history('/admin/requests/spaces'));
  };
  return (
    <>
      <Helmet title={'Create Space Request'} />
      <SpaceRequestCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateSpaceRequest;
