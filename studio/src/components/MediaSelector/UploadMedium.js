import React from 'react';
import UppyUploader from '../Uppy';
import { useDispatch } from 'react-redux';
import { addMedium } from '../../actions/media';

function UploadMedium({ onMediaUpload, profile = false }) {
  const dispatch = useDispatch();
  const onUpload = (values) => {
    dispatch(addMedium(values, profile)).then((medium) => {
      if (values.length === 1 || profile) {
        onMediaUpload(values, medium);
      }
    });
  };
  return <UppyUploader onUpload={onUpload} profile={profile} />;
}

export default UploadMedium;
