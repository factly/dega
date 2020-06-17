import React from 'react';
import FormatsCreateForm from './components/FormatsCreateForm';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormat } from '../../actions/formats';
import { useHistory } from 'react-router-dom';
import useQuery from '../../utils/useQuery';

function EditFormat() {
  const history = useHistory();
  const query = useQuery();
  const id = query.get('id');

  const dispatch = useDispatch();
  const { format } = useSelector((state) => {
    const { details } = state.formats;
    const format = details[id];

    return {
      format,
    };
  });

  const onCreate = (values) => {
    dispatch(updateFormat({ ...format, ...values }));
    history.push('/formats');
  };
  return <FormatsCreateForm data={format} onCreate={onCreate} />;
}

export default EditFormat;
