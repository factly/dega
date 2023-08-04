import React from 'react';
import { useDispatch } from 'react-redux';
import { createFormat } from '../../actions/formats';
 
import FormatCreateForm from './components/FormatForm';
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function CreateFormat({ setReloadFlag, reloadFlag }) {
  const history = useNavigation();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createFormat(values)).then(() => {
      history('/settings/advanced/formats');
      setReloadFlag(!reloadFlag);
    });
  };
  return (
    <>
      <Helmet title={'Create Format'} />
      <FormatCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateFormat;
