import React from 'react';
import SpaceCreateForm from './components/SpaceCreateForm';
import { useDispatch } from 'react-redux';
import { addSpaces } from '../../actions/spaces';

function CreateSpace() {
  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addSpaces(values));
    console.log('Received values of form: ', values);
  };
  return <SpaceCreateForm onCreate={onCreate} />;
}

export default CreateSpace;
