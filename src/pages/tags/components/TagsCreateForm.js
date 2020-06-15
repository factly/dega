import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space, Divider, Select, Upload } from 'antd';
import { useSelector } from 'react-redux';

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

const TagCreateForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();
  const { details } = useSelector((state) => state.tags);
  const tags = Object.keys(details).map((key, index) => details[key]);

  const onReset = () => {
    form.resetFields();
  };

  const normFile = (e) => {
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
      name="create-tag"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
    >
      <Form.Item name="parent_id" label="Parent Tag">
        <Select
          showSearch
          placeholder="Select parent tag"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          <Option key="0" value={0}>
            Parent Tag
          </Option>
          {tags.map((tag) => (
            <Option key={tag.id} value={tag.value}>
              {tag.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="name"
        label="Tag Name"
        rules={[
          {
            required: true,
            message: 'Please enter tag name!',
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

export default TagCreateForm;
