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
  const [isMobileScreen, setIsMobileScreen] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobileScreen(true);
      } else {
        setIsMobileScreen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);


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
          <Col md={6} xs={24}>
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
          <Col md={6}>
            <Button
              style={{ marginTop: isMobileScreen || '32px' }}
              onClick={() => {
                addMenu.current();
              }}
            >
              <PlusOutlined /> Add menu
            </Button>
          </Col>
        </Row>
        <Row style={{ width: '100%' }}>
          <Col span={24}>
            <Form.List name="menu" style={{ width: '100%' }}>
              {(fields, { add, remove }) => {
                addMenu.current = add;
                return (
                  <div style={{ width: '100%' }}>
                    {fields.map((field, index) => (
                      <Row
                        key={field.key}
                        style={{
                          background: '#f1f1f16b',
                          marginTop: '16px',
                          width: '100%',
                          paddingTop: '16px',
                          borderRadius: '8px',
                          overflowX: isMobileScreen ? 'scroll' : 'hidden',
                        }}
                      >
                        <Col span={24}>
                          <Form.Item>
                            <Row key={index} align="middle" justify={isMobileScreen ? "end" :"start"} style={{ gap: '16px' }}>
                              <Col md={6} xs={24}>
                                <MenuField field={field} />
                              </Col>
                              <Col>
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
                              <Submenu fieldKey={field.name} isMobileScreen={isMobileScreen} />
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
        <Row>
          <Col xs={24} md={9}>
            <Form.Item style={{ marginTop: '20px' }} name="meta_fields" label="Metafields">
              <MonacoEditor language="json" width={"100%"} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </ConfigProvider>
  );
}

export default MenuForm;
