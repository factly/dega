import React from 'react';
import CategoryCreateForm from './components/CategoryForm';
import { useDispatch } from 'react-redux';
import { createCategory } from '../../actions/categories';

import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';
function CreateCategory() {
  const history = useNavigation();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createCategory(values)).then(() => history('/categories'));
  };
  return (
    <>
      <Helmet title={'Create Category'} />
      <CategoryCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateCategory;
