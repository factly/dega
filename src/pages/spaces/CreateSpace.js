import React from 'react';
import SpaceCreateForm from './components/SpaceCreateForm';
import { useDispatch } from 'react-redux';
import { addSpace } from '../../actions/spaces';
import { useHistory } from 'react-router-dom';

function CreateSpace() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addSpace(values)).then(() => history.push('/spaces'));
  };
  return <SpaceCreateForm onCreate={onCreate} />;
}

export default CreateSpace;
