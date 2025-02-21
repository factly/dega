import React from 'react';
import PostForm from './components/PostForm';
import { useDispatch, useSelector } from 'react-redux';
import { addPost } from '../../actions/posts';
import getUserPermission from '../../utils/getUserPermission';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { AppDispatch, RootState } from '../../store/types';
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

interface Format {
  id: string;
  loading: boolean;
  article: any; // Define proper type based on your article structure
}

interface CreatePostProps {
  formats: Format;
}

const CreatePost: React.FC<CreatePostProps> = ({ formats }) => {
  const spaces = useSelector((state: RootState) => state.spaces);
  const actions = getUserPermission({ resource: 'posts', action: 'get', spaces });
  const history = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const onCreate = (values: any) => {
    dispatch(addPost(values)).then((post) => {
      if (post && post.id) history(`/posts/${post.id}/edit`);
    });
  };

  if (!formats.loading && formats.article) {
    return (
      <>
        <Helmet title="Create Post" />
        <PostForm onCreate={onCreate} actions={actions} format={formats.article} />
      </>
    );
  }

  return <FormatNotFound status="info" title="Article format not found" link="/formats" />;
};

export default CreatePost;