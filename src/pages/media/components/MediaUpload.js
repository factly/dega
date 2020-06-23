import React from 'react';
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import GoogleDrive from '@uppy/google-drive';
import Url from '@uppy/url';
import { DashboardModal } from '@uppy/react';
import { useDispatch } from 'react-redux';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/url/dist/style.css';

import { addMedium } from '../../../actions/media';
import { Button } from 'antd';

function MediaUploader() {
  const dispatch = useDispatch();

  const [show, setShow] = React.useState(false);

  const uppy = Uppy({
    id: 'uppy-media',
    meta: { type: 'avatar' },
    allowedFileTypes: ['image/*'],
    autoProceed: false,
  })
    .use(AwsS3, { companionUrl: 'http://localhost:3020' })
    .use(Url, { companionUrl: 'http://localhost:3020' })
    .use(GoogleDrive, { companionUrl: 'http://localhost:3020' });

  uppy.on('complete', (result) => {
    const successful = result.successful[0];
    const upload = {};

    upload['alt_text'] = successful.meta.caption;
    upload['caption'] = successful.meta.caption;
    upload['description'] = successful.meta.caption;
    upload['dimensions'] = '100x100';
    upload['file_size'] = successful.size;
    upload['name'] = successful.meta.name;
    upload['slug'] = successful.meta.caption;
    upload['title'] = successful.meta.caption;
    upload['type'] = successful.meta.type;
    upload['url'] = successful.uploadURL;
    dispatch(addMedium(upload));
  });
  return (
    <div>
      <Button onClick={() => setShow(true)}>Upload</Button>
      <DashboardModal
        uppy={uppy}
        closeModalOnClickOutside
        open={show}
        onRequestClose={() => setShow(false)}
        plugins={['GoogleDrive', 'Url']}
        metaFields={[
          { id: 'name', name: 'Name', placeholder: 'file name' },
          { id: 'caption', name: 'Caption', placeholder: 'describe what the image is about' },
        ]}
      />
    </div>
  );
}

export default MediaUploader;
