import React from 'react';
import { Button, Form, Input, Space, Row, Col, Switch, Collapse, ConfigProvider } from 'antd';
import { maker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import getJsonValue from '../../../utils/getJsonValue';
import { DescriptionInput, MetaForm, SlugInput, TitleInput } from '../../../components/FormItems';

const { TextArea } = Input;

const ClaimantForm = ({ onCreate, data = {} }) => {
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
        name="creat-claimant"
        style={{ padding: '0 1rem' }}
        layout="vertical"
        className="edit-form"
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
        <Row justify="center" style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Col span={24}>
            <Row justify="end" gutter={40}>
              <Form.Item>
                <Space>
                  <Button htmlType="button" onClick={onReset}>
                    Reset
                  </Button>
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
                style={{ width: '100%', background: '#f0f2f5', border: 0, marginBottom: 16 }}
              >
                <Collapse.Panel header="General">
                  <Row style={{ background: '#F9FAFB', marginBottom: '1rem', gap: '1rem' }}>
                    <Col xs={24} md={10}>
                      <TitleInput
                        onChange={(e) => onTitleChange(e.target.value)}
                        name="name"
                        label="Claimant Name"
                      />
                      <SlugInput />
                      <Form.Item label="Featured" name="is_featured" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                      <Form.Item name="tag_line" label="Tag Line">
                        <TextArea />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                      <Form.Item label="Featured Image" name="medium_id">
                        <MediaSelector
                          maxWidth={'350px'}
                          containerStyles={{ justifyContent: 'start' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={10}>
                      <DescriptionInput
                        inputProps={{
                          style: {
                            minHeight: '92px',
                            background: '#F9FAFB',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid rgba(0, 0, 0, 0.15)',
                          },
                          placeholder: 'Enter Description...',
                          basic: true,
                        }}
                        initialValue={data.description_html}
                      />
                    </Col>
                  </Row>
                </Collapse.Panel>
              </Collapse>
            </Row>
            <Col span={24}>
              <Row gutter={40}>
                <MetaForm style={{ marginBottom: 16, background: '#f0f2f5', border: 0 }} />
              </Row>
            </Col>
          </Col>
        </Row>
      </Form>
    </ConfigProvider>
  );
};

export default ClaimantForm;
