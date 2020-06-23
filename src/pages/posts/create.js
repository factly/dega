import React from 'react';
import PostCreateForm from './components/PostCreateForm';
import { useDispatch } from 'react-redux';
import { addPost } from '../../actions/posts';
import { useHistory } from 'react-router-dom';

function CreatePost() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addPost(values)).then(() => history.push('/posts'));
  };
  return <PostCreateForm onCreate={onCreate} />;
}

export default CreatePost;
