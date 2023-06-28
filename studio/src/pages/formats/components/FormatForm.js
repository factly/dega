import React from 'react';
import { Button, Col, Form, Input, Row, Space, Switch, Collapse, ConfigProvider } from 'antd';
import { maker } from '../../../utils/sluger';
import getJsonValue from '../../../utils/getJsonValue';
import MediaSelector from '../../../components/MediaSelector/index';
import { MetaForm, SlugInput } from '../../../components/FormItems';

const { TextArea } = Input;

const FormatForm = ({ onCreate, data = {} }) => {
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

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            colorBgContainer: '#F9FAFB',
            colorText: '#000000E0',
          },
        },
      }}
    >
      <Form
        form={form}
        initialValues={{ ...data }}
        name="create-format"
        layout="vertical"
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
        <Row
          gutter={[0, 16]}
          justify="center"
          style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}
        >
          <Col span={24}>
            <Row justify="end" gutter={40}>
              <Form.Item>
                <Space>
                  <Button disabled={!valueChange} type="primary" htmlType="submit">
                    {data && data.id ? 'Update' : 'Submit'}
                  </Button>
                </Space>
              </Form.Item>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={40}>
              <Collapse
                expandIconPosition="right"
                expandIcon={({ isActive }) => <Button>{isActive ? 'Collapse' : 'Expand'}</Button>}
                style={{ width: '100%', background: '#f0f2f5', border: 0 }}
              >
                <Collapse.Panel header="General">
                  <Row style={{ background: '#F9FAFB', marginBottom: '1rem', gap: '3rem' }}>
                    <Col md={10} xs={24}>
                      <Form.Item
                        name="name"
                        label="Format Name"
                        rules={[
                          {
                            required: true,
                            message: 'Please enter the name!',
                          },
                          { min: 3, message: 'Name must be minimum 3 characters.' },
                          { max: 50, message: 'Name must be maximum 50 characters.' },
                        ]}
                      >
                        <Input onChange={(e) => onTitleChange(e.target.value)} />
                      </Form.Item>
                      <SlugInput />
                      <Form.Item name="is_featured" valuePropName="checked">
                        <Row justify={'space-between'} align={'middle'}>
                          <span>Featured</span>
                          <Switch />
                        </Row>
                      </Form.Item>
                      <Form.Item name="description" label="Description">
                        <TextArea rows={5} />
                      </Form.Item>
                    </Col>
                    <Col md={6} xs={24}>
                      <Form.Item label="Featured Image" name="medium_id">
                        <MediaSelector
                          maxWidth={'250px'}
                          containerStyles={{
                            maxWidth: '250px',
                            justifyContent: 'start',
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Collapse.Panel>
              </Collapse>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={40}>
              <MetaForm style={{ marginBottom: 16, background: '#f0f2f5', border: 0 }} />
            </Row>
          </Col>
        </Row>
      </Form>
    </ConfigProvider>
  );
};

export default FormatForm;
