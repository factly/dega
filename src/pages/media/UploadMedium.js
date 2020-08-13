import React from 'react';
import UppyUploader from '../../components/Uppy';
import { useDispatch } from 'react-redux';
import { addMedium } from '../../actions/media';
import { useHistory } from 'react-router-dom';

function UploadMedium() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onUpload = (values) => {
    dispatch(addMedium(values)).then(() => history.push('/media'));
  };
  return <UppyUploader onUpload={onUpload} />;
}

export default UploadMedium;
