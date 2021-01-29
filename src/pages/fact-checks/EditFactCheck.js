import React from 'react';
import EditFactCheckForm from './components/FactCheckForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updatePost, getPost, publishPost, addTemplate } from '../../actions/posts';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import getUserPermission from '../../utils/getUserPermission';

function EditFactCheck() {
  const history = useHistory();
  const { id } = useParams();
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'fact check', action: 'get', spaces });
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
  const onUpdate = (values) => {
    if (values.status === 'draft')
      dispatch(updatePost({ ...post, ...values })).then(() => {
        history.push('/fact-check');
      });
    if (values.status === 'publish')
      dispatch(publishPost({ ...post, ...values })).then(() => history.push('/fact-check'));
    if (values.status === 'template')
      dispatch(updatePost({ ...post, ...values})).then(() => {
        history.push('/fact-check');
      })  
      
  };
  return <EditFactCheckForm data={post} onCreate={onUpdate} actions={actions} />;


}

export default EditFactCheck;