import React from 'react';
import ClaimantCreateForm from './components/ClaimantCreateForm';
import { useDispatch } from 'react-redux';
import { addClaimant } from '../../actions/claimants';
import { useHistory } from 'react-router-dom';

function CreateClaimant() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addClaimant(values)).then(() => history.push('/claimants'));
  };
  return <ClaimantCreateForm onCreate={onCreate} />;
}

export default CreateClaimant;
