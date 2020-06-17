import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';

import SpaceEditForm from './components/SpaceEditForm';
import { addSpace } from '../../actions/spaces';

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
    dispatch(addSpace(values));
    history.push('/spaces');
  };

  if (loading) return <Skeleton />;

  return <SpaceEditForm onCreate={onCreate} data={space} />;
}

export default SpaceEdit;
