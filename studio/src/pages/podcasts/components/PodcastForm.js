import React from 'react';
import { Button, Form, Space, Row, Col, ConfigProvider, Collapse, Select } from 'antd';
import { maker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import Selector from '../../../components/Selector';
import getJsonValue from '../../../utils/getJsonValue';
import { DescriptionInput, MetaForm, SlugInput, TitleInput } from '../../../components/FormItems';

const layout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};

const { Option } = Select;

const PodcastForm = ({ onCreate, data = {} }) => {
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
        {...layout}
        layout="vertical"
        form={form}
        className="edit-form"
        style={{ padding: '0 1rem' }}
        initialValues={{ ...data, language: 'english' }}
        name="create-category"
        onFinish={(values) => {
          if (values.meta_fields) {
            values.meta_fields = getJsonValue(values.meta_fields);
          }
          onCreate({
            ...values,
            category_ids: values.categories || [],
          });
          onReset();
        }}
        onValuesChange={() => {
          setValueChange(true);
        }}
      >
        <Row
          justify="center"
          gutter={[0, 16]}
          style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}
        >
          <Col span={24}>
            <Row justify="end" gutter={40}>
              <Form.Item>
                <Space>
                  <Button disabled={!valueChange} type="primary" htmlType="submit">
                    {data && data.id ? 'Update' : 'Save'}
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
                <Collapse.Panel header="Basic" key="1">
                  <Row
                    style={{ background: '#F9FAFB', marginBottom: '1rem' }}
                    gutter={{ xs: 16, md: 54 }}
                  >
                    <Col xs={24} md={10}>
                      <TitleInput onChange={(e) => onTitleChange(e.target.value)} />
                      <SlugInput />
                      <Form.Item name="language" label="Language">
                        <Select defaultValue="english" style={{ width: 120 }}>
                          <Option value="english">English</Option>
                          <Option value="telugu">Telugu</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item name="categories" label="Categories">
                        <Selector mode="multiple" action="Categories" createEntity="Category" />
                      </Form.Item>
                      <DescriptionInput
                        type="editor"
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
                        rows={5}
                        initialValue={data.description_html}
                      />
                    </Col>
                    <Col xs={24} md={6}>
                      <Form.Item label="Featured Image" name="medium_id">
                        <MediaSelector
                          maxWidth={'238px'}
                          containerStyles={{ justifyContent: 'start' }}
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

export default PodcastForm;
