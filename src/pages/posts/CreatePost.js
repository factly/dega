import React from 'react';
import PostForm from './components/PostForm';
import { useDispatch, useSelector } from 'react-redux';
import { addPost, publish } from '../../actions/posts';
import { useHistory } from 'react-router-dom';
import getUserPermission from '../../utils/getUserPermission';
import {Result, Button, Skeleton} from 'antd';
import { Link } from 'react-router-dom';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';

function CreatePost({formats}) {
  const history = useHistory();
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'posts', action: 'get', spaces });

  const dispatch = useDispatch();
  const onCreate = (values) => {
    if (values.status === 'draft') dispatch(addPost(values)).then(() => history.push('/posts'));
    if (values.status === 'publish') dispatch(publish(values)).then(() => history.push('/posts'));
  };
  if(!formats.loading && formats.article) {
    return <PostForm onCreate={onCreate} actions={actions} format={formats.article}/>;
  } 
  else {
    return (
      <FormatNotFound status="info" title="Article format not found" link="/formats"/>
    ) 
  }
}

export default CreatePost;
