import React from 'react';
import { Button, Form, Input } from 'antd';
import TextArea from 'antd/lib/input/TextArea';

const layout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 14,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

const SpaceCreateForm = ({ onCreate }) => {
  const [form] = Form.useForm();

  const onReset = () => {
    form.resetFields();
  };

  // const onFill = () => {
  //   form.setFieldsValue({
  //     name: 'Name',
  //   });
  // };

  return (
    <Form {...layout} form={form} name="create-space" onFinish={onCreate}>
      <Form.Item
        name="name"
        label="Name"
        rules={[
          {
            required: true,
            message: 'Please input the name of space!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="slug"
        label="Slug"
        rules={[
          {
            required: true,
            message: 'Please input the slug of space!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="site_address"
        label="Website"
        rules={[
          {
            required: true,
            message: 'Please input the website of space!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="site_title"
        label="Title"
        rules={[
          {
            required: true,
            message: 'Please input the title of space!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="tag_line"
        label="Tag line"
        rules={[
          {
            required: true,
            message: 'Please input the tag line of space!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[
          {
            required: true,
            message: 'Please input the description of space!',
          },
        ]}
      >
        <TextArea />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Create
        </Button>
        <Button htmlType="button" onClick={onReset}>
          Reset
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SpaceCreateForm;
