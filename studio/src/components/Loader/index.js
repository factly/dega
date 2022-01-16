import React from 'react';
import { Spin } from 'antd';

const Loader = () => {
  return (
    <div
      style={{
        position: 'absolute',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
      }}
    >
      <Spin size="large" />
    </div>
  );
};

export default Loader;
