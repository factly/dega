import React from 'react';
import FormatEditForm from './components/FormatForm';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormat, getFormat } from '../../actions/formats';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Result } from 'antd';

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

  if (loading && !format) {
    return ( 
      <Result 
        status="404"
        title="404"
        subTitle="Sorry, could not find what you are looking for."
      />
    );
  }

  const onUpdate = (values) => {
    dispatch(updateFormat({ ...format, ...values }));
    history.push('/formats');
  };
  return <FormatEditForm data={format} onCreate={onUpdate} />;
}

export default EditFormat;
