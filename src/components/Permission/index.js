import React from 'react';
import { Checkbox } from 'antd';

const options = [
  { label: 'Get', value: 'get' },
  { label: 'Create', value: 'create' },
  { label: 'Update', value: 'update' },
  { label: 'Delete', value: 'delete' },
];

function Permission({ value, onChange }) {
  return (
    <Checkbox.Group value={value} options={options} onChange={(actions) => onChange(actions)} />
  );
}

export default Permission;
