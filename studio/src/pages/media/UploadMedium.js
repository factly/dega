import React from 'react';
import UppyUploader from '../../components/Uppy';
import { useDispatch } from 'react-redux';
import { createMedium } from '../../actions/media';
 
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function UploadMedium() {
  const history = useNavigation();

  const dispatch = useDispatch();
  const onUpload = (values) => {
    dispatch(createMedium(values)).then(() => history('/media'));
  };
  return (
    <>
      <Helmet title={'Upload Medium'} />
      <UppyUploader onUpload={onUpload} />
    </>
  );
}

export default UploadMedium;
