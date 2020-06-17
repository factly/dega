import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Skeleton } from 'antd';

import SpaceEditForm from './components/SpaceEditForm';

function SpaceEdit() {
  const { id } = useParams();

  const { space, loading } = useSelector((state) => {
    return {
      space: state.spaces.details[id],
      loading: state.spaces.loading,
    };
  });

  const onCreate = (values) => {
    console.log(values);
  };

  if (loading) return <Skeleton />;

  return <SpaceEditForm onCreate={onCreate} data={space} />;
}

export default SpaceEdit;
