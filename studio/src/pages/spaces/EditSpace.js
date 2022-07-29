import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Skeleton } from 'antd';
import { updateSpace } from '../../actions/spaces';
import SpaceEditForm from './components/SpaceEditForm';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';

function EditSpace() {
  const history = useHistory();
  const { id } = useParams();
  const dispatch = useDispatch();

  const { space, loading } = useSelector((state) => {
    return {
      space: state.spaces.details[id],
      loading: state.spaces.loading,
    };
  });

  const onCreate = (values) => {
    dispatch(updateSpace({ ...space, ...values })).then(() =>
      history.push(`/admin/spaces`),
    );
  };

  if (loading) return <Skeleton />;

  if (!space) {
    return <RecordNotFound />;
  }

  return (
    <>
      <Helmet title={`${space?.name} - Edit Space`} />
      <SpaceEditForm onCreate={onCreate} data={space} />
    </>
  );
}

export default EditSpace;
