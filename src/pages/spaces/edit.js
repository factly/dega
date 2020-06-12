import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';

import SpaceCreateForm from './components/SpaceCreateForm';
import { addSpaces } from '../../actions/spaces';
import useQuery from '../../utils/useQuery';

function EditSpace() {
  const history = useHistory();
  const query = useQuery();
  const id = query.get('id');
  const dispatch = useDispatch();

  const { space, loading } = useSelector((state) => {
    return {
      space: state.spaces.details[id],
      loading: state.spaces.loading,
    };
  });

  const onCreate = (values) => {
    dispatch(addSpaces(values));
    history.push('/spaces');
  };

  if (loading) return <Skeleton />;

  return <SpaceCreateForm onCreate={onCreate} data={space} />;
}

export default EditSpace;
