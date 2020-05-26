import React from 'react';
import SpaceCreateForm from './components/SpaceCreateForm';
import { useDispatch } from 'react-redux';
import { addSpaces } from '../../actions/spaces';
import { useHistory } from 'react-router-dom';

function CreateSpace() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addSpaces(values));
    history.push('/spaces');
    console.log('Received values of form: ', values);
  };
  return <SpaceCreateForm onCreate={onCreate} />;
}

export default CreateSpace;
