import React from 'react';
import { Form, Input, Button, Space, Row, Col, ConfigProvider } from 'antd';
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

  const addMenu = React.useRef(null);

  const onReset = () => {
    form.resetFields();
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            marginLG: 12,
          },
          Collapse: {
            colorBgContainer: '#F9FAFB',
            colorText: '#000000E0',
          },
          Button: {
            colorBorder: '#1890FF',
            colorText: '#1890FF',
          },
        },
      }}
    >
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
        layout="vertical"
        onValuesChange={() => {
          setValueChange(true);
        }}
      >
        <Row justify="end">
          <Form.Item>
            <Button
              style={{ borderColor: !valueChange && '#d9d9d9' }}
              type="primary"
              disabled={!valueChange}
              htmlType="submit"
            >
              {data && data.id ? 'Update' : 'Save'}
            </Button>
          </Form.Item>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
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
          </Col>
          <Col span={6}>
            <Button
              style={{ marginTop: '32px' }}
              onClick={() => {
                addMenu.current();
              }}
            >
              <PlusOutlined /> Add menu
            </Button>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.List name="menu" style={{ width: '100%' }}>
              {(fields, { add, remove }) => {
                addMenu.current = add;
                return (
                  <div style={{ width: '100%', marginLeft: '-25px' }}>
                    {fields.map((field, index) => (
                      <Row
                        key={field.key}
                        style={{
                          background: '#f1f1f16b',
                          margin: '16px',
                          paddingTop: '16px',
                          borderRadius: '8px',
                        }}
                      >
                        <Col span={24}>
                          <Form.Item>
                            <Row key={index} align="middle" justify="start" gutter={16}>
                              <Col span={6}>
                                <MenuField field={field} />
                              </Col>
                              <Col span={6}>
                                <Button
                                  onClick={() => {
                                    remove(field.name);
                                  }}
                                >
                                  Remove menu
                                </Button>
                              </Col>
                            </Row>
                            <div style={{ marginLeft: '25px' }}>
                              <Submenu fieldKey={field.name} />
                            </div>
                          </Form.Item>
                        </Col>
                      </Row>
                    ))}
                  </div>
                );
              }}
            </Form.List>
          </Col>
        </Row>
        <Form.Item style={{ marginTop: '20px' }} name="meta_fields" label="Metafields">
          <MonacoEditor language="json" />
        </Form.Item>
      </Form>
    </ConfigProvider>
  );
}

export default MenuForm;
