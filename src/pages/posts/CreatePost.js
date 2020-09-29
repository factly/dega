import React from 'react';
import PostForm from './components/PostForm';
import { useDispatch } from 'react-redux';
import { addPost, publish } from '../../actions/posts';
import { useHistory } from 'react-router-dom';

function CreatePost() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    if (values.status === 'draft') dispatch(addPost(values)).then(() => history.push('/posts'));
    if (values.status === 'publish') dispatch(publish(values)).then(() => history.push('/posts'));
  };
  return <PostForm onCreate={onCreate} />;
}

export default CreatePost;
