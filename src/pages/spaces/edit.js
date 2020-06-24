import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Skeleton } from 'antd';
import { updateSpace } from './../../actions/spaces';
import SpaceEditForm from './components/SpaceEditForm';

function SpaceEdit() {
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
    dispatch(updateSpace({ ...space, ...values })).then(() => history.push('/spaces'));
  };

  if (loading) return <Skeleton />;

  return <SpaceEditForm onCreate={onCreate} data={space} />;
}

export default SpaceEdit;
