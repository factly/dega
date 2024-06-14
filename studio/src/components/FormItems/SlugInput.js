import React from 'react';
import { checker } from '../../utils/sluger';
import { Form, Input } from 'antd';

const SlugInput = ({ onChange, inputProps, formItemProps }) => {
  inputProps = onChange ? { ...inputProps, onChange } : { ...inputProps };
  return (
    <Form.Item
      name="slug"
      rules={[
        {
          required: true,
          message: 'Please input the slug!',
        },
        {
          pattern: checker,
          message: 'Please enter valid slug!',
        },
      ]}
      {...formItemProps}
    >
      <label>Slug</label>
      <Input {...inputProps} />
    </Form.Item>
  );
};

export default SlugInput;
