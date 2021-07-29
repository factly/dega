import React from 'react';
import placeholderImg from './placeholderImage.svg';
function PlaceholderImage(props) {
  return (
    <>
      <img
        src={placeholderImg}
        width={props.width}
        height={props.height}
        alt=""
        style={{ objectFit: 'contain', padding: '1rem', maxWidth: '240px' }}
      />
    </>
  );
}

PlaceholderImage.defaultProps = {
  height: 'auto',
  width: '100%',
};

export default PlaceholderImage;
