import React from 'react';
import { Form, Input } from 'antd';

const TitleInput = ({ name = 'title', label = 'Title', onChange, inputProps, formItemProps }) => {
  inputProps = onChange ? { ...inputProps, onChange } : inputProps;
  formItemProps = { ...formItemProps, label };
  return (
    <Form.Item
      name={name}
      rules={[
        {
          required: true,
          message: `Please enter ${name}!`,
        },
        { min: 3, message: 'Name must be minimum 3 characters.' },
        { max: 50, message: 'Name must be maximum 50 characters.' },
      ]}
      {...formItemProps}
    >
      <Input {...inputProps} />
    </Form.Item>
  );
};

export default TitleInput;
