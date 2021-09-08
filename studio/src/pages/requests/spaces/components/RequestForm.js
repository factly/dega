import React from 'react';
import { Button, Form, InputNumber, Space, Switch, Input, Select } from 'antd';

import { spaceSelector } from '../../../../selectors/spaces';
import { useSelector } from 'react-redux';
import { TitleInput } from '../../../../components/FormItems';

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

const RequestForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();

  const onReset = () => {
    form.resetFields();
  };

  const { spaces, loading } = useSelector(spaceSelector);

  return (
    <Form
      {...layout}
      form={form}
      initialValues={data}
      name="create-category"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
    >
      <TitleInput />
      <Form.Item name="space_id" label="Space">
        <Select
          allowClear
          bordered
          listHeight={128}
          loading={loading}
          defaultValue={[]}
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {spaces.map((item) => (
            <Select.Option value={item.id} key={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="posts"
        label="Posts"
        rules={[
          {
            required: true,
            message: 'Please enter the numeric value!',
          },
        ]}
      >
        <InputNumber min={-1} />
      </Form.Item>
      <Form.Item
        name="episodes"
        label="Episodes"
        rules={[
          {
            required: true,
            message: 'Please enter the numeric value!',
          },
        ]}
      >
        <InputNumber min={-1} />
      </Form.Item>
      <Form.Item
        name="media"
        label="Media"
        rules={[
          {
            required: true,
            message: 'Please enter the numeric value!',
          },
        ]}
      >
        <InputNumber min={-1} />
      </Form.Item>
      <Form.Item label="Fact Check" name="fact_check" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item label="Podcast" name="podcast" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea />
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

export default RequestForm;
