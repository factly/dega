import React from 'react';
import ClaimantCreateForm from './components/ClaimantForm';
import { useDispatch } from 'react-redux';
import { createClaimant } from '../../actions/claimants';
 
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function CreateClaimant() {
  const history = useNavigation();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createClaimant(values)).then(() => history('/claimants'));
  };
  return (
    <>
      <Helmet title={'Create Claimants'} />
      <ClaimantCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateClaimant;
