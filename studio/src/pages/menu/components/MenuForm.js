import React from 'react';
import { Form, Input, Button, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import MenuField from './MenuField';
import Submenu from './Submenu';
import MonacoEditor from '../../../components/MonacoEditor';
import getJsonValue from '../../../utils/getJsonValue';

function MenuForm({ onCreate, data = {} }) {
  if (data && data.meta_fields) {
    if (typeof data.meta_fields !== 'string') {
      data.meta_fields = JSON.stringify(data.meta_fields);
    }
  }
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = React.useState(false);

  const onReset = () => {
    form.resetFields();
  };

  return (
    <div>
      <Form
        form={form}
        initialValues={{ ...data }}
        onFinish={(values) => {
          if (values.meta_fields) {
            values.meta_fields = getJsonValue(values.meta_fields);
          }
          onCreate(values);
          onReset();
        }}
        onValuesChange={() => {
          setValueChange(true);
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
              </div>
            );
          }}
        </Form.List>
        <Form.Item style={{ marginTop: '20px' }} name="meta_fields" label="Metafields">
          <MonacoEditor language="json" />
        </Form.Item>
        <Form.Item>
          <Button disabled={!valueChange} htmlType="submit">
            {data && data.id ? 'Update' : 'Submit'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default MenuForm;
