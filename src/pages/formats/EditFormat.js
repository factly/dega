import React from 'react';
import FormatsCreateForm from './components/FormatsCreateForm';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormat, getFormat } from '../../actions/formats';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Skeleton } from 'antd';

function EditFormat() {
  const history = useHistory();
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

  const onUpdate = (values) => {
    dispatch(updateFormat({ ...format, ...values }));
    history.push('/formats');
  };
  return <FormatsCreateForm data={format} onCreate={onUpdate} />;
}

export default EditFormat;
