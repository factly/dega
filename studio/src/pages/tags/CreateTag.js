import React from 'react';
import { useDispatch } from 'react-redux';
import { createTag } from '../../actions/tags';

import TagCreateForm from './components/TagForm';
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function CreateTag() {
  const history = useNavigation();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createTag(values)).then(() => history('/tags'));
  };
  return (
    <>
      <Helmet title={'Create Tag'} />
      <TagCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateTag;
