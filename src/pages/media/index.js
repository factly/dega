import React from 'react';
import { Space } from 'antd';

import MediaList from './components/MediaList';
import MediaUploader from './components/MediaUpload';

function Media() {
  return (
    <Space direction="vertical">
      <MediaUploader />
      <MediaList />
    </Space>
  );
}

export default Media;
