import React from 'react';
import { Result } from 'antd';

function RecordNotFound() {
  return (
    <Result 
        status="404"
        title="404"
        subTitle="Sorry, could not find what you are looking for."
      />
  );
};

export default RecordNotFound;