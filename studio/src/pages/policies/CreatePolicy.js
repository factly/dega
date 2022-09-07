import React from 'react';
import { createPolicy } from '../../actions/policies';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PolicyCreateForm from './components/PolicyForm';
import { Helmet } from 'react-helmet';

function CreatePolicy() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    values.permissions = values.permissions?.filter(
      (item) => item && item.resource && item.actions.length > 0,
    );
    dispatch(createPolicy(values)).then(() => history.push('/members/policies'));
  };

  return (
    <>
      <Helmet title={'Create Policy'} />
      <PolicyCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreatePolicy;
