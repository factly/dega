import React from 'react';
import { Checkbox } from 'antd';

const options = [
  { label: 'Get', value: 'get' },
  { label: 'Create', value: 'create' },
  { label: 'Update', value: 'update' },
  { label: 'Delete', value: 'delete' },
];

function Permission({ value, onChange, type }) {
  const middleChange = (actions) => {
    onChange({
      resource: type,
      actions: actions,
    });
  };
  return (
    <Checkbox.Group
      value={value ? value.actions : []}
      options={options}
      onChange={(actions) => middleChange(actions)}
    />
  );
}

export default Permission;
