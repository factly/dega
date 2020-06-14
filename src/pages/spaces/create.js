import React from 'react';
import SpaceCreateForm from './components/SpaceCreateFrom';
import { useDispatch } from 'react-redux';
import { addSpaces } from '../../actions/spaces';
import { useHistory } from 'react-router-dom';

function CreateSpace() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addSpaces(values));
    history.push('/spaces');
  };
  return <SpaceCreateForm onCreate={onCreate} />;
}

export default CreateSpace;
