import React from 'react';
import CategoryCreateForm from './components/CategoryCreateForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateCategory, getCategories } from '../../actions/categories';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function EditSpace() {
  const history = useHistory();
  const { id } = useParams();

  const dispatch = useDispatch();

  const { category, loading } = useSelector((state) => {
    return {
      category: state.categories.details[id] ? state.categories.details[id] : null,
      loading: state.categories.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getCategories(id));
  }, [dispatch, id]);

  if (loading) return <Skeleton />;

  const onUpdate = (values) => {
    dispatch(updateCategory({ ...category, ...values }));
    history.push('/categories');
  };
  return <CategoryCreateForm data={category} onCreate={onUpdate} />;
}

export default EditSpace;
