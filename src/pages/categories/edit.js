import React from 'react';
import CategoryCreateForm from './components/CategoryCreateForm';
import { useDispatch, useSelector } from 'react-redux';
import { addCategory } from '../../actions/categories';
import { useHistory } from 'react-router-dom';
import useQuery from '../../utils/useQuery';
import _ from 'lodash';

function EditSpace() {
  const history = useHistory();
  const query = useQuery();
  const id = query.get('id');

  const dispatch = useDispatch();
  const { category } = useSelector((state) => {
    const { categories, ...other } = state.categories;
    const category = _.find(categories, { id: parseInt(id) });
    return {
      category,
      ...other,
    };
  });

  const onCreate = (values) => {
    dispatch(addCategory(values));
    history.push('/categories');
    console.log('Received values of form: ', values);
  };
  return <CategoryCreateForm data={category} onCreate={onCreate} />;
}

export default EditSpace;
