import React from 'react';
import { Space, Button } from 'antd';

import MediumList from './components/MediumList';
import { Link } from 'react-router-dom';

function Media() {
  return (
    <Space direction="vertical">
      <Link to="/media/upload">
        <Button>Upload</Button>
      </Link>
      <MediumList />
    </Space>
  );
}

export default Media;
