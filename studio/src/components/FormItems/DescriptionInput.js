import React from 'react';
import { Form } from 'antd';
import Editor from '../Editor';

const DescriptionInput = ({
  name = 'description',
  label = 'Description',
  noLabel = false,
  onChange = () => {},
  inputProps,
  formItemProps,
}) => {
  inputProps = { ...inputProps, onChange };
  formItemProps = noLabel ? formItemProps : { ...formItemProps, label };

  return (
    <Form.Item name={name} {...formItemProps}>
      <Editor {...inputProps} />
    </Form.Item>
  );
};

export default DescriptionInput;
