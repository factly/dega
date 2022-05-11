import React from 'react';
import { useDispatch } from 'react-redux';
import { createTag } from '../../actions/tags';
import { useHistory } from 'react-router-dom';
import TagCreateForm from './components/TagForm';
import { Helmet } from 'react-helmet';

function CreateTag() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createTag(values)).then(() => history.push('/tags'));
  };
  return (
    <>
      <Helmet title={'Create Tag'} />
      <TagCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateTag;
