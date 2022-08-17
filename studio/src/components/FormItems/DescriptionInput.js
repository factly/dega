import React from 'react';
import { Form } from 'antd';
// import Editor from '../Editor';
import { Editor } from '@factly/scooter';
const DescriptionInput = ({
  name = 'description',
  label = 'Description',
  noLabel = false,
  onChange = (data) => console.log(data),
  inputProps,
  formItemProps,
  initialValue,
}) => {
  inputProps = { ...inputProps, onChange };
  formItemProps = noLabel ? formItemProps : { ...formItemProps, label };

  return (
    <Form.Item name={name} {...formItemProps}>
      {console.log({ inputProps, formItemProps, initialValue })}
      {/* <Editor {...inputProps} /> */}
      <Editor
        menuType="bubble"
        heightStrategy="flexible"
        rows={20}
        onChange={({ json, html }) => console.log({ json, html })}
        {...inputProps}
        initialValue={initialValue}
      />
    </Form.Item>
  );
};

export default DescriptionInput;
