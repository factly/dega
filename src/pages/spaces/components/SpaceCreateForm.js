import React from 'react';
import { Button, Form, Input, Space } from 'antd';
const { TextArea } = Input;

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
    offset: 10,
    span: 14,
  },
};

const SpaceCreateForm = ({ onCreate, data = {} }) => {
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
    <Form
      {...layout}
      form={form}
      initialValues={data}
      name="create-space"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
    >
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
        <Space>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default SpaceCreateForm;
