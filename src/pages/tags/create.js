import React from 'react';
import { useDispatch } from 'react-redux';
import { addTag } from '../../actions/tags';
import { useHistory } from 'react-router-dom';
import TagCreateForm from './components/TagsCreateForm';

function CreateTag() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addTag(values));
    history.push('/tags');
    console.log('Received values of form: ', values);
  };
  return <TagCreateForm onCreate={onCreate} />;
}

export default CreateTag;
