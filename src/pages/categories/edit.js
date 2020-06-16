import React from 'react';
import CategoryCreateForm from './components/CategoryCreateForm';
import { useDispatch, useSelector } from 'react-redux';
import { updateCategory } from '../../actions/categories';
import { useHistory } from 'react-router-dom';
import useQuery from '../../utils/useQuery';

function EditSpace() {
  const history = useHistory();
  const query = useQuery();
  const id = query.get('id');

  const dispatch = useDispatch();
  const { category } = useSelector((state) => {
    const { details } = state.categories;
    const category = details[id];
    return {
      category,
    };
  });

  const onCreate = (values) => {
    dispatch(updateCategory({ ...category, ...values }));
    history.push('/categories');
  };
  return <CategoryCreateForm data={category} onCreate={onCreate} />;
}

export default EditSpace;
