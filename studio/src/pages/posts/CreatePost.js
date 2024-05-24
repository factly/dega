import React from 'react';
import PostForm from './components/PostForm';
import { useDispatch, useSelector } from 'react-redux';
import { addPost } from '../../actions/posts';
import getUserPermission from '../../utils/getUserPermission';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';

import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function CreatePost({ formats }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'posts', action: 'get', spaces });
  const history = useNavigation();
  const dispatch = useDispatch();

  const onCreate = (values) => {
    dispatch(addPost(values)).then((post) => {
      if (post && post.id) history(`/posts/${post.id}/edit`);
    });
  };
  if (!formats.loading && formats.article) {
    return (
      <>
        <Helmet title={'Create Post'} />
        <PostForm onCreate={onCreate} actions={actions} format={formats.article} />
      </>
    );
  }

  return <FormatNotFound status="info" title="Article format not found" link="/formats" />;
}

export default CreatePost;
