import React from 'react';
import { Button, Form, Input, Space } from 'antd';
import { maker, checker } from './../../../utils/sluger';

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

const FormatCreateForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();

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
      name="create-format"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
    >
      <Form.Item
        name="name"
        label="Format Name"
        rules={[
          {
            required: true,
            message: 'Please enter name!',
          },
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
            message: 'Slug can not have whitespaces!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Space>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default FormatCreateForm;
