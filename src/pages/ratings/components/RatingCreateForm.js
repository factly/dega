import React from 'react';
import { Button, Form, Input, Space, InputNumber } from 'antd';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';

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

const RatingCreateForm = ({ onCreate, data = {} }) => {
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
      name="creat-rating"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
    >
      <Form.Item
        name="name"
        label="Rating Name"
        rules={[
          {
            required: true,
            message: 'Please enter the name!',
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
      <Form.Item
        name="description"
        label="Description"
        rules={[
          {
            required: true,
            message: 'Please input the description!',
          },
        ]}
      >
        <TextArea />
      </Form.Item>
      <Form.Item name="numeric_value" label="numeric_value">
        <InputNumber min={1} max={5} defaultValue={3} />
      </Form.Item>
      <Form.Item label="Upload Media" name="medium_id">
        <MediaSelector />
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

export default RatingCreateForm;
