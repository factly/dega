import React, { useState } from 'react';
import { Row, Col, Button, Form, Space, Switch, Collapse, ConfigProvider } from 'antd';
import { maker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import { SketchPicker } from 'react-color';
import Selector from '../../../components/Selector';
import getJsonValue from '../../../utils/getJsonValue';

import { DescriptionInput, MetaForm, SlugInput, TitleInput } from '../../../components/FormItems';

const CategoryForm = ({ onCreate, data = {} }) => {
  const setLoading = data.id ? false : true;

  if (data && data.meta_fields) {
    if (typeof data.meta_fields !== 'string') {
      data.meta_fields = JSON.stringify(data.meta_fields);
    }
  }
  const [formData, setFormData] = useState(data);
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = React.useState(false);
  const [backgroundColour, setBackgroundColour] = useState(
    data.background_colour ? data.background_colour : null,
  );
  const [displayBgColorPicker, setDisplayBgColorPicker] = useState(false);
  const handleBgClick = () => {
    setDisplayBgColorPicker((prev) => !prev);
    setValueChange(true);
  };
  const handleBgClose = () => {
    setDisplayBgColorPicker(false);
  };
  const onReset = () => {
    form.resetFields();
  };

  const onTitleChange = (title) => {
    const slug = maker(title);
    const values = {
      slug: slug,
      meta: {
        canonical_URL: slug,
        facebook: {
          title: title,
          canonical_URL: slug,
        },
        twitter: {
          title: title,
          canonical_URL: slug,
        },
        google: {
          title: title,
          canonical_URL: slug,
        },
      },
    };
    form.setFieldsValue(values);
    setFormData(form.getFieldValue());
  };


  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            colorBgContainer: "#F9FAFB"
          }
        },
      }}
    >
      <Form
        form={form}
        initialValues={{ ...formData }}
        style={{ padding: '0 1rem' }}
        name="create-category"
        layout="vertical"
        onFinish={(values) => {
          if (values.meta_fields) {
            values.meta_fields = getJsonValue(values.meta_fields);
          }
          values.background_colour = backgroundColour;
          console.log('Received values of form: ', values);
          onCreate(values);
          onReset();
        }}
        onValuesChange={(changedFields, allFields) => {
          setValueChange(true);
          setFormData(allFields);
        }}
      >
        <Row justify="center" gutter={[0, 16]} style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
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
                <Collapse.Panel header="General">
                  <Row
                    style={{ background: '#F9FAFB', marginBottom: '1rem', gap: "2rem", }}
                  >
                    <Col span={10}>
                      <TitleInput
                        name="name"
                        label="Category Name"
                        onChange={(e) => onTitleChange(e.target.value)}
                      />
                      <Col>
                        <Form.Item name="parent_id" label="Parent Category">
                          <Selector
                            action="Categories"
                            setLoading={setLoading}
                            invalidOptions={data?.id ? [data.id] : []}
                          />
                        </Form.Item>
                      </Col>
                      <Col>
                        <Form.Item name="is_featured" valuePropName="checked">
                          <Row justify="space-between">
                            <Col> Featured </Col>
                            <Col><Switch onChange={(checked) => form.setFieldsValue({ is_featured: checked })}
                              defaultChecked={data.is_featured} />
                            </Col>
                          </Row>
                        </Form.Item>
                      </Col>
                      <Col>
                        <Form.Item name="background_colour" label="Colour">
                          <div style={{ position: 'relative', width: "100%" }}>
                            <div
                              style={{
                                padding: '5px',
                                width: "100%",
                                background: '#fff',
                                borderRadius: '1px',
                                boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                                display: 'inline-block',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleBgClick()}
                            >
                              <div
                                style={{
                                  width: '100%',
                                  height: '24px',
                                  borderRadius: '2px',
                                  background: `${backgroundColour && backgroundColour.hex}`,
                                }}
                              />
                            </div>
                            {displayBgColorPicker ? (
                              <div style={{ position: 'absolute', zIndex: '2', top: 0, left: '100%' }}>
                                <div
                                  style={{
                                    position: 'fixed',
                                    top: '0px',
                                    right: '0px',
                                    bottom: '0px',
                                    left: '0px',
                                  }}
                                  onClick={() => handleBgClose()}
                                />
                                <SketchPicker
                                  color={backgroundColour !== null && backgroundColour.hex}
                                  onChange={(e) => setBackgroundColour(e)}
                                  disableAlpha
                                />
                              </div>
                            ) : null}
                          </div>
                        </Form.Item>
                      </Col>
                      <SlugInput
                        onChange={(e) =>
                          form.setFieldsValue({
                            meta: {
                              canonical_URL: e.target.value,
                              facebook: {
                                canonical_URL: e.target.value,
                              },
                              google: {
                                canonical_URL: e.target.value,
                              },
                              twitter: {
                                canonical_URL: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <DescriptionInput
                        inputProps={{
                          style: { minHeight: "92px", background: '#F9FAFB', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: "1px solid rgba(0, 0, 0, 0.15)" },
                          placeholder: 'Enter Description...',
                          basic: true,
                        }}
                        rows={5}
                        initialValue={formData.description_html}
                      />
                    </Col>
                    <Col span={6}>
                      <Form.Item label="Featured Image" name="medium_id">
                        <MediaSelector maxWidth={'350px'} containerStyles={{ justifyContent: 'start' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Collapse.Panel>
              </Collapse>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={40}>
              <MetaForm form={form} formData={formData} style={{ marginBottom: 16, background: '#f0f2f5', border: 0 }} />
            </Row>
          </Col>
        </Row >
      </Form >
    </ConfigProvider>
  );
};

export default CategoryForm;
