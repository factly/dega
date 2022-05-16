import React from 'react';
import PostForm from './components/PostForm';
import { useDispatch, useSelector } from 'react-redux';
import { addPost, getPosts } from '../../actions/posts';
import getUserPermission from '../../utils/getUserPermission';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function CreatePost({ formats }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'posts', action: 'get', spaces });
  const history = useHistory();
  const dispatch = useDispatch();

  const onCreate = (values) => {
    dispatch(addPost(values)).then((post) => {
      if (post && post.id) history.push(`/posts/${post.id}/edit`);
    });
  };

  const fetchPosts = () => {
    dispatch(getPosts())
  }

  React.useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [dispatch])


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
