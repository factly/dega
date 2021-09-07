import React from 'react';
import ClaimantCreateForm from './components/ClaimantForm';
import { useDispatch } from 'react-redux';
import { createClaimant } from '../../actions/claimants';
import { useHistory } from 'react-router-dom';

function CreateClaimant() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createClaimant(values)).then(() => history.push('/claimants'));
  };
  return <ClaimantCreateForm onCreate={onCreate} />;
}

export default CreateClaimant;
