import React from 'react';
import { createPolicy } from '../../actions/policies';
import { useDispatch } from 'react-redux';
 
import PolicyCreateForm from './components/PolicyForm';
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function CreatePolicy() {
  const history = useNavigation();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    values.permissions = values.permissions?.filter(
      (item) => item && item.resource && item.actions.length > 0,
    );
    dispatch(createPolicy(values)).then(() => history('/settings/members/policies'));
  };

  return (
    <>
      <Helmet title={'Create Policy'} />
      <PolicyCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreatePolicy;
