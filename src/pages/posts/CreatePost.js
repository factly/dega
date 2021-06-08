import React from 'react';
import PostForm from './components/PostForm';
import { useDispatch, useSelector } from 'react-redux';
import { addPost } from '../../actions/posts';
import getUserPermission from '../../utils/getUserPermission';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { useHistory } from 'react-router-dom';

function CreatePost({ formats }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'posts', action: 'get', spaces });
  const history = useHistory();
  const [newPost, setNewPost] = React.useState(false);
  const posts = useSelector(({ posts }) => posts);
  const dispatch = useDispatch();
  if (newPost) {
    history.push(`/posts/${posts.recent.data.id}/edit`);
    setNewPost(false);
  }
  const onCreate = (values) => {
    if (values.status === 'publish') {
      dispatch(addPost(values)).then(() => setNewPost(true));
    } else {
      dispatch(addPost(values));
    }
  };
  if (!formats.loading && formats.article) {
    return <PostForm onCreate={onCreate} actions={actions} format={formats.article} />;
  }

  return <FormatNotFound status="info" title="Article format not found" link="/formats" />;
}

export default CreatePost;
