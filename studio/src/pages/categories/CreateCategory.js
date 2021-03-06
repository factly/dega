import React from 'react';
import CategoryCreateForm from './components/CategoryForm';
import { useDispatch } from 'react-redux';
import { createCategory } from '../../actions/categories';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
function CreateCategory() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createCategory(values)).then(() => history.push('/categories'));
  };
  return (
    <>
      <Helmet title={'Create Category'} />
      <CategoryCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateCategory;
