import React from 'react';
import PostEditForm from './components/PostForm';
import { useDispatch, useSelector } from 'react-redux';
import { Result } from 'antd';
import { updatePost, getPost, publishPost, addTemplate } from '../../actions/posts';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function EditPost() {
  const history = useHistory();
  const { id } = useParams();

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

  if (loading && !post) {
    return ( 
      <Result 
        status="404"
        title="404"
        subTitle="Sorry, could not find what you are looking for."
      />
    );
  };

  const onUpdate = (values) => {
    if (values.status === 'draft')
      dispatch(updatePost({ ...post, ...values })).then(() => {
        history.push('/posts');
      });
    if (values.status === 'publish')
      dispatch(publishPost({ ...post, ...values })).then(() => history.push('/posts'));

    if (values.status === 'template')
      dispatch(addTemplate({ post_id: parseInt(id) })).then(() => history.push('/posts'));
  };
  return <PostEditForm data={post} onCreate={onUpdate} />;
}

export default EditPost;
