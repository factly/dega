import React from 'react';
import CategoryEditForm from './components/CategoryForm';
import { useDispatch, useSelector } from 'react-redux';
import { updateCategory, getCategory } from '../../actions/categories';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';
function EditCategory() {
  const history = useHistory();
  const { id } = useParams();

  const dispatch = useDispatch();

  const { category } = useSelector((state) => {
    return {
      category: state.categories.details[id] ? state.categories.details[id] : null,
    };
  });

  React.useEffect(() => {
    dispatch(getCategory(id));
  }, [dispatch, id]);

  //if (loading) return <Skeleton />;

  if (!category) {
    return <RecordNotFound />;
  }

  const onUpdate = (values) => {
    dispatch(updateCategory({ ...category, ...values })).then(() =>
      history.push(`/categories/${id}/edit`),
    );
  };
  if (category)
    return (
      <>
        <Helmet title={`${category?.name} - Edit Category`} />
        <CategoryEditForm data={category} onCreate={onUpdate} />
      </>
    );
}

export default EditCategory;
