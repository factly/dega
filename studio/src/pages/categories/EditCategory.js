import React from 'react';
import CategoryEditForm from './components/CategoryForm';
import { useDispatch, useSelector } from 'react-redux';
import { updateCategory, getCategory } from '../../actions/categories';

import { useParams } from 'react-router-dom';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';
import { Skeleton } from 'antd';
import useNavigation from '../../utils/useNavigation';
function EditCategory() {
  const history = useNavigation();
  const { id } = useParams();

  const dispatch = useDispatch();

  const { category, loading } = useSelector((state) => {
    return {
      category: state.categories.details[id] ? state.categories.details[id] : null,
      loading: state.categories.loading,
    };
  });
  React.useEffect(() => {
    dispatch(getCategory(id));
  }, [dispatch, id]);

  if (loading) return <Skeleton />;

  if (!category) {
    return <RecordNotFound />;
  }
  const onUpdate = (values) => {
    dispatch(updateCategory({ ...category, ...values })).then(() => {
      history(`/categories/${id}/edit`);
    });
  };

  return (
    <>
      <Helmet title={`${category?.name} - Edit Category`} />
      <CategoryEditForm data={category} onCreate={onUpdate} />
    </>
  );
}

export default EditCategory;
