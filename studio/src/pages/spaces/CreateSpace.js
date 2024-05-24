import React from 'react';
import SpaceCreateForm from './components/SpaceCreateForm';
import { useDispatch } from 'react-redux';
import { addSpace, getSpaces } from '../../actions/spaces';

import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function CreateSpace() {
  const history = useNavigation();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addSpace(values)).then(() => {
      dispatch(getSpaces());
      history('/admin/spaces');
    });
  };
  return (
    <>
      <Helmet title={'Create Space'} />
      <SpaceCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateSpace;
