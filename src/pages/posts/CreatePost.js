import React from 'react';
import PostForm from './components/PostForm';
import { useDispatch, useSelector } from 'react-redux';
import { addPost, publish } from '../../actions/posts';
import { useHistory } from 'react-router-dom';
import getUserPermission from '../../utils/getUserPermission';

function CreatePost() {
  const history = useHistory();
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'posts', action:'get', spaces });

  const dispatch = useDispatch();
  const onCreate = (values) => {
    if (values.status === 'draft') dispatch(addPost(values)).then(() => history.push('/posts'));
    if (values.status === 'publish') dispatch(publish(values)).then(() => history.push('/posts'));
  };
  return <PostForm onCreate={onCreate} actions={actions}/>;
}

export default CreatePost;
