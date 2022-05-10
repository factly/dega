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
        { max: 500, message: 'Name must be maximum 50 characters.' },
      ]}
      {...formItemProps}
    >
      <Input {...inputProps} />
    </Form.Item>
  );
};

export default TitleInput;
