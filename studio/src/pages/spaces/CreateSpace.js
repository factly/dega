import React from 'react';
import SpaceCreateForm from './components/SpaceCreateForm';
import { useDispatch } from 'react-redux';
import { addSpace, getSpaces } from '../../actions/spaces';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function CreateSpace() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addSpace(values)).then(() => {
      dispatch(getSpaces());
      history.push('/admin/spaces');
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
