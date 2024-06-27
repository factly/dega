import React from 'react';
import PostEditForm from './components/PostForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updatePost, getPost } from '../../actions/posts';

import { useParams } from 'react-router-dom';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import getUserPermission from '../../utils/getUserPermission';
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function EditPost({ formats }) {
  const history = useNavigation();
  const { id } = useParams();
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'posts', action: 'get', spaces });

  const dispatch = useDispatch();

  const { post, loading } = useSelector((state) => {
    return {
      post: state.posts.details[id] ? state.posts.details[id] : null,
      loading: state.posts.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getPost(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Skeleton />;

  if (!post) {
    return <RecordNotFound />;
  }
  if (post && post.id && !formats.loading && post.format !== formats.article.id)
    return <RecordNotFound />;

  const onUpdate = (values) => {
    dispatch(updatePost({ ...post, ...values })).then(() => {
      history(`/posts/${id}/edit`);
    });
  };
  return (
    <>
      <Helmet title={`${post?.title} - Edit Post`} />
      <PostEditForm data={post} onCreate={onUpdate} actions={actions} format={formats.article} />
    </>
  );
}

export default EditPost;
