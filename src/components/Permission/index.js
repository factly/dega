import React from 'react';
import { Checkbox } from 'antd';

function Permission({ value, onChange, entity }) {
  const options = [
    { label: 'Get', value: 'get' },
    { label: 'Create', value: 'create' },
    { label: 'Update', value: 'update' },
    { label: 'Delete', value: 'delete' },
  ];

  if (entity === 'posts') {
    options.push({ label: 'Publish', value: 'publish' });
  }

  return (
    <Checkbox.Group value={value} options={options} onChange={(actions) => onChange(actions)} />
  );
}

export default Permission;
