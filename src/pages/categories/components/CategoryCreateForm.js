import React from 'react';
import { useSelector } from 'react-redux';
import { InboxOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space, Divider, Select, Upload } from 'antd';
const { TextArea } = Input;
const { Option } = Select;

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

const CategoryCreateForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();

  const onReset = () => {
    form.resetFields();
  };

  const normFile = (e) => {
    console.log('Upload event:', e);

    if (Array.isArray(e)) {
      return e;
    }

    return e && e.fileList;
  };
  return (
    <Form
      {...layout}
      form={form}
      initialValues={{ ...data }}
      name="create-category"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
    >
      <Form.Item
        name="name"
        label="Category Name"
        rules={[
          {
            required: true,
            message: 'Please enter category name!',
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
        name="description"
        label="Description"
        rules={[
          {
            required: true,
            message: 'Please input the description of category!',
          },
        ]}
      >
        <TextArea />
      </Form.Item>
      <Divider></Divider>
      <Form.Item label="Upload Media">
        <Form.Item name="dragger" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
          <Upload.Dragger name="files" action="/upload.do">
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">Support for a single or bulk upload.</p>
          </Upload.Dragger>
        </Form.Item>
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

export default CategoryCreateForm;
