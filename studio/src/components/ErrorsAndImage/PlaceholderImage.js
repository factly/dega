import React from 'react';
import placeholderImg from './placeholderImage.svg';
function PlaceholderImage({ width, height, maxWidth }) {
  return (
    <>
      <img
        src={placeholderImg}
        width={width}
        height={height}
        alt=""
        style={{ objectFit: 'contain', padding: '1rem', maxWidth: maxWidth || '240px' }}
      />
    </>
  );
}

PlaceholderImage.defaultProps = {
  height: 'auto',
  width: '100%',
};

export default PlaceholderImage;
