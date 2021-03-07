import React from 'react';
import { Button, Form, InputNumber, Space, Select, Input } from 'antd';
import { useSelector } from 'react-redux';

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

  const orgs = useSelector(({ spaces }) => spaces.orgs);

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
      <Form.Item name="organisation_id" label="Organisation">
        <Select
          allowClear
          bordered
          listHeight={128}
          defaultValue={[]}
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {orgs.map((item) => (
            <Select.Option value={item.id} key={item.id}>
              {item.title}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="spaces"
        label="Spaces"
        rules={[
          {
            required: true,
            message: 'Please enter the numeric value!',
          },
        ]}
      >
        <InputNumber min={-1} />
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
