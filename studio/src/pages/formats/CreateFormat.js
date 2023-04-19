import React from 'react';
import { useDispatch } from 'react-redux';
import { createFormat } from '../../actions/formats';
import { useHistory } from 'react-router-dom';
import FormatCreateForm from './components/FormatForm';
import { Helmet } from 'react-helmet';

function CreateFormat({ setReloadFlag, reloadFlag }) {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createFormat(values)).then(() => {
      history.push('/settings/advanced/formats');
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
