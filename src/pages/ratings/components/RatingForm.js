import React, { useState } from 'react';
import { Button, Form, Input, Space, InputNumber } from 'antd';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import Editor from '../../../components/Editor';
import { ChromePicker } from 'react-color';

const layout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 8,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

const RatingForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();
  const [color, setColor] = useState(data.colour ? data.colour : null);
  const [valueChange, setValueChange] = React.useState(false);

  const colorPicker = (e) => {
    setColor(e);
  };

  const onReset = () => {
    form.resetFields();
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  return (
    <Form
      {...layout}
      form={form}
      initialValues={{ ...data }}
      name="creat-rating"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
      onValuesChange={() => {
        setValueChange(true);
      }}
    >
      <Form.Item
        name="name"
        label="Rating"
        rules={[
          {
            required: true,
            message: 'Please enter the name!',
          },
          { min: 3, message: 'Name must be minimum 3 characters.' },
          { max: 50, message: 'Name must be maximum 50 characters.' },
        ]}
      >
        <Input onChange={(e) => onTitleChange(e.target.value)} />
      </Form.Item>
      <Form.Item
        name="slug"
        label="Slug"
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
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="numeric_value"
        label="Numeric value"
        rules={[
          {
            required: true,
            message: 'Please enter the numeric value!',
          },
        ]}
      >
        <InputNumber min={1} max={5} />
      </Form.Item>
      <Form.Item name="medium_id" label="Featured Image">
        <MediaSelector />
      </Form.Item>
      <Form.Item name="colour" label="Colour">
        <ChromePicker
          color={color !== null && color.hex}
          onChange={(e) => colorPicker(e)}
          disableAlpha
        />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Editor style={{ width: '600px' }} placeholder="Enter Description..." />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Space>
          <Button disabled={!valueChange} type="primary" htmlType="submit">
            {data && data.id ? 'Update' : 'Submit'}
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default RatingForm;
