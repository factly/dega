import React from 'react';
import UppyUploader from '../Uppy';
import { useDispatch } from 'react-redux';
import { addMedium } from '../../actions/media';

function UploadMedium() {
  const dispatch = useDispatch();
  const onUpload = (values) => {
    dispatch(addMedium(values));
  };
  return <UppyUploader onUpload={onUpload} />;
}

export default UploadMedium;
