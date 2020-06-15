import React from 'react';
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import GoogleDrive from '@uppy/google-drive';
import Url from '@uppy/url';
import { Dashboard } from '@uppy/react';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/url/dist/style.css';

import { addMedium } from '../../actions/media';
import MediaList from './components/MediaList';

const uppy = Uppy({
  id: 'uppy-media',
  meta: { type: 'avatar' },
  restrictions: { maxNumberOfFiles: 1 },
  autoProceed: false,
})
  .use(AwsS3, { companionUrl: 'http://localhost:3020' })
  .use(Url, { companionUrl: 'http://localhost:3020' })
  .use(GoogleDrive, { companionUrl: 'http://localhost:3020' });

uppy.on('complete', (result) => {
  addMedium(result);
});

function Media() {
  return (
    <div>
      <MediaList />
    </div>
  );
}

export default Media;
