import React from 'react';
import { Modal, Button } from 'antd';
import MediaList from './components/MediaList';
import MediaUploader from './components/MediaUpload';

function Media() {
  return (
    <div>
      <MediaUploader />
      <MediaList />
    </div>
  );
}

export default Media;
