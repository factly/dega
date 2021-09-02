import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Skeleton } from 'antd';
import { updateSpace } from '../../actions/spaces';

import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import WebsiteEditForm from './components/WebsiteEditForm';

function EditWebsite() {
  const id = useSelector((state) => state.spaces.selected);
  const dispatch = useDispatch();

  const { space, loading } = useSelector((state) => {
    return {
      space: state.spaces.details[id],
      loading: state.spaces.loading,
    };
  });

  const onCreate = (values) => {
    dispatch(updateSpace({ ...space, ...values }));
  };

  if (loading) return <Skeleton />;

  if (!space) {
    return <RecordNotFound />;
  }

  return <WebsiteEditForm onCreate={onCreate} data={space} />;
}

export default EditWebsite;
