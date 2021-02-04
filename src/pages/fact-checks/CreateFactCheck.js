import React from 'react';
import FactCheckForm from './components/FactCheckForm';
import { useDispatch, useSelector } from 'react-redux';
import { addPost, publish } from '../../actions/posts';
import { useHistory } from 'react-router-dom';
import getUserPermission from '../../utils/getUserPermission';

function CreateFactCheck() {
  const history = useHistory();
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'factchecks', action: 'get', spaces });

  const dispatch = useDispatch();
  const onCreate = (values) => {
    if (values.status === 'draft')
      dispatch(addPost(values)).then(() => history.push('/fact-check'));
    if (values.status === 'publish')
      dispatch(publish(values)).then(() => history.push('/fact-check'));
  };
  return <FactCheckForm onCreate={onCreate} actions={actions} />;
}

export default CreateFactCheck;
