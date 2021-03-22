import React from 'react';
import UppyUploader from '../Uppy';
import { useDispatch } from 'react-redux';
import { addMedium } from '../../actions/media';

function UploadMedium( { onMediaUpload } ) {
  const dispatch = useDispatch();
  const onUpload = (values) => {
    dispatch(addMedium(values)).then(() => {
      if (values.length === 1) {
        onMediaUpload(values);
      }
    });
  };
  return <UppyUploader onUpload={onUpload} />;
}

export default UploadMedium;
