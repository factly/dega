import React from 'react';
import FormatEditForm from './components/FormatForm';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormat, getFormat } from '../../actions/formats';

import { useParams } from 'react-router-dom';
import { Skeleton } from 'antd';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function EditFormat() {
  const history = useNavigation();
  const { id } = useParams();

  const dispatch = useDispatch();
  const { format, loading } = useSelector((state) => {
    return {
      format: state.formats.details[id] ? state.formats.details[id] : null,
      loading: state.formats.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getFormat(id));
  }, [dispatch, id]);

  if (loading) return <Skeleton />;

  if (!format) {
    return <RecordNotFound />;
  }

  const onUpdate = (values) => {
    dispatch(updateFormat({ ...format, ...values }));
    history(`/settings/advanced/formats/${id}/edit`);
  };
  return (
    <>
      <Helmet title={`${format?.name} - Edit Format`} />
      <FormatEditForm data={format} onCreate={onUpdate} />
    </>
  );
}

export default EditFormat;
