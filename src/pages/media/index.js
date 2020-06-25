import React from 'react';
import { Space, Button } from 'antd';

import MediaList from './components/MediaList';
import { Link } from 'react-router-dom';

function Media() {
  return (
    <Space direction="vertical">
      <Link to="/media/upload">
        <Button>Upload</Button>
      </Link>
      <MediaList />
    </Space>
  );
}

export default Media;
