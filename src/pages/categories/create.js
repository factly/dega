import React from 'react';
import CategoryCreateForm from './components/CategoryCreateForm';
import { useDispatch } from 'react-redux';
import { addCategory } from '../../actions/categories';
import { useHistory } from 'react-router-dom';

function CreateCategory() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addCategory(values));
    history.push('/categories');
    console.log('Received values of form: ', values);
  };
  return <CategoryCreateForm onCreate={onCreate} />;
}

export default CreateCategory;
