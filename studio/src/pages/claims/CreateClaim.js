import React from 'react';
import ClaimCreateForm from './components/ClaimForm';
import { useDispatch } from 'react-redux';
import { createClaim } from '../../actions/claims';
import { useHistory } from 'react-router-dom';

function CreateClaim() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createClaim(values)).then(() => history.push('/claims'));
  };
  return <ClaimCreateForm onCreate={onCreate} />;
}

export default CreateClaim;
