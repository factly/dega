import React from 'react';

function ThreeEditIcon({ color = '#858585' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 6 18">
      <circle cx="3" cy="2.92" r="2.04" fill={color}></circle>
      <circle cx="3" cy="9" r="2.04" fill={color}></circle>
      <circle cx="3" cy="15.08" r="2.04" fill={color}></circle>
    </svg>
  );
}

export default ThreeEditIcon;
