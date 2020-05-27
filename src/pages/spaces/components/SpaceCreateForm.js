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

const SpaceCreateForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();
  const {
    spaces: { spaces },
  } = useSelector((state) => state);

  const onReset = () => {
    form.resetFields();
  };

  // const onFill = () => {
  //   form.setFieldsValue({
  //     name: 'Name',
  //   });
  // };
  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        style={{
          width: 70,
        }}
      >
        {spaces.map((space) => (
          <Option value={space.id}>{space.title}</Option>
        ))}
      </Select>
    </Form.Item>
  );

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
      initialValues={data}
      name="create-space"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
    >
      <Form.Item
        name="name"
        label="Space Name"
        rules={[
          {
            required: true,
            message: 'Please enter space name!',
          },
        ]}
      >
        <Input
          addonBefore={prefixSelector}
          style={{
            width: '100%',
          }}
        />
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
      <Divider></Divider>
      <strong>
        <Form.Item label="About Space"></Form.Item>
      </strong>
      <Form.Item
        name="contact_info"
        label="Contact Info"
        rules={[{ required: true, message: 'Please input your contact number!' }]}
      >
        <Input style={{ width: '100%' }} />
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

export default SpaceCreateForm;
