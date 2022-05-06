import React from 'react';
import ClaimantCreateForm from './components/ClaimantForm';
import { useDispatch } from 'react-redux';
import { createClaimant } from '../../actions/claimants';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function CreateClaimant() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createClaimant(values)).then(() => history.push('/claimants'));
  };
  return (
    <>
      <Helmet title={'Create Claimants'} />
      <ClaimantCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateClaimant;
