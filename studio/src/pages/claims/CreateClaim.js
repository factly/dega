import React from 'react';
import ClaimCreateForm from './components/ClaimForm';
import { useDispatch } from 'react-redux';
import { createClaim } from '../../actions/claims';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function CreateClaim() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createClaim(values)).then(() => history.push('/claims'));
  };
  return (
    <>
      <Helmet title={'Create Claim'} />
      <ClaimCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateClaim;
