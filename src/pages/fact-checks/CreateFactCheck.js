import React from 'react';
import FactCheckForm from './components/FactCheckForm';
import { useDispatch, useSelector } from 'react-redux';
import { addPost, publish } from '../../actions/posts';
import { useHistory } from 'react-router-dom';
import getUserPermission from '../../utils/getUserPermission';

function CreateFactCheck() {
  const history = useHistory();
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'fact check', action: 'get', spaces });

  const dispatch = useDispatch();
  const onCreate = (values) => {
    console.log('values',values);
    if (values.status === 'draft') dispatch(addPost(values)).then(() => history.push('/posts'));
    if (values.status === 'publish') dispatch(publish(values)).then(() => history.push('/posts'));
  };
  return <FactCheckForm onCreate={onCreate} actions={actions} />;
}

export default CreateFactCheck;