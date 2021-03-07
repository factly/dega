import React from 'react';
import { Form, Input, Button, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import MenuField from './MenuField';
import Submenu from './Submenu';

function MenuForm({ onCreate, data = {} }) {
  const [form] = Form.useForm();
  const onReset = () => {
    form.resetFields();
  };
  return (
    <div>
      <Form
        form={form}
        initialValues={{ ...data }}
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
              message: 'Please input the name!',
            },
          ]}
        >
          <Input placeholder="Enter name" />
        </Form.Item>
        <Form.List name="menu">
          {(fields, { add, remove }) => {
            return (
              <div>
                {fields.map((field, index) => (
                  <Space key={field.key} style={{ display: 'flex' }} align="start">
                    <Form.Item>
                      <Space direction="horizontal" key={index}>
                        <MenuField field={field} />
                        <MinusCircleOutlined
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      </Space>
                      <div style={{ marginLeft: '25px' }}>
                        <Submenu fieldKey={field.name} />
                      </div>
                    </Form.Item>
                  </Space>
                ))}
                <Button
                  onClick={() => {
                    add();
                  }}
                >
                  <PlusOutlined /> Add menu
                </Button>
                <Button htmlType="submit">Submit</Button>
              </div>
            );
          }}
        </Form.List>
      </Form>
    </div>
  );
}

export default MenuForm;
