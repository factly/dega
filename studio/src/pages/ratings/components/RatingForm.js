import React, { useState } from 'react';
import { Button, Form, Space, Row, Col, ConfigProvider, InputNumber, Collapse } from 'antd';
import { maker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import { SketchPicker } from 'react-color';
import getJsonValue from '../../../utils/getJsonValue';
import { DescriptionInput, MetaForm, SlugInput, TitleInput } from '../../../components/FormItems';

const RatingForm = ({ onCreate, data = {} }) => {
  if (data && data.meta_fields) {
    if (typeof data.meta_fields !== 'string') {
      data.meta_fields = JSON.stringify(data.meta_fields);
    }
  }
  const [form] = Form.useForm();
  const [backgroundColour, setBackgroundColour] = useState(
    data.background_colour ? data.background_colour : null,
  );
  const [textColour, setTextColour] = useState(data.text_colour ? data.text_colour : null);
  const [valueChange, setValueChange] = React.useState(false);
  const [displayBgColorPicker, setDisplayBgColorPicker] = useState(false);
  const [displayTextColorPicker, setDisplayTextColorPicker] = useState(false);

  const handleBgClick = () => {
    setDisplayBgColorPicker((prev) => !prev);
    setValueChange(true);
  };
  const handleTextClick = () => {
    setDisplayTextColorPicker((prev) => !prev);
    setValueChange(true);
  };

  const handleBgClose = () => {
    setDisplayBgColorPicker(false);
  };
  const handleTextClose = () => {
    setDisplayTextColorPicker(false);
  };

  const onReset = () => {
    form.resetFields();
    setBackgroundColour(data.background_colour ? data.background_colour : null);
    setTextColour(data.text_colour ? data.text_colour : null);
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
        style={{ padding: '0 1rem' }}
        initialValues={{ ...data }}
        name="creat-rating"
        layout="vertical"
        className="edit-form"
        onFinish={(values) => {
          if (values.meta_fields) {
            values.meta_fields = getJsonValue(values.meta_fields);
          }
          values.text_colour = textColour;
          values.background_colour = backgroundColour;
          onCreate(values);
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
                defaultActiveKey={['general']}
              >
                <Collapse.Panel header="General" key="general">
                  <Row
                    style={{ background: '#F9FAFB', marginBottom: '1rem' }}
                    gutter={{ xs: 16, md: 70 }}
                  >
                    <Col xs={24} md={10}>
                      <TitleInput
                        name="name"
                        label="Rating Name"
                        onChange={(e) => onTitleChange(e.target.value)}
                      />
                      <SlugInput />
                      <Form.Item
                        name="numeric_value"
                        label="Numeric value"
                        rules={[
                          {
                            required: true,
                            message: 'Please enter the numeric value!',
                          },
                        ]}
                      >
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </Form.Item>

                      <Form.Item name="background_colour" label="Background Colour">
                        <div style={{ position: 'relative' }}>
                          <div
                            style={{
                              padding: '5px',
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
                                width: '100px',
                                height: '24px',
                                borderRadius: '2px',
                                background: `${backgroundColour && backgroundColour.hex}`,
                              }}
                            />
                          </div>
                          {displayBgColorPicker ? (
                            <div
                              style={{ position: 'absolute', zIndex: '2', top: 0, left: '120px' }}
                            >
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
                      <Form.Item name="text_colour" label="Text Colour">
                        <div style={{ position: 'relative' }}>
                          <div
                            style={{
                              padding: '5px',
                              background: '#fff',
                              borderRadius: '1px',
                              boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                              display: 'inline-block',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleTextClick()}
                          >
                            <div
                              style={{
                                width: '100px',
                                height: '24px',
                                borderRadius: '2px',
                                background: `${textColour && textColour.hex}`,
                              }}
                            />
                          </div>
                          {displayTextColorPicker ? (
                            <div
                              style={{ position: 'absolute', zIndex: '2', top: 0, left: '120px' }}
                            >
                              <div
                                style={{
                                  position: 'fixed',
                                  top: '0px',
                                  right: '0px',
                                  bottom: '0px',
                                  left: '0px',
                                }}
                                onClick={() => handleTextClose()}
                              />
                              <SketchPicker
                                color={textColour !== null && textColour.hex}
                                onChange={(e) => setTextColour(e)}
                                disableAlpha
                              />
                            </div>
                          ) : null}
                        </div>
                      </Form.Item>

                      <Form.Item
                        className="preview-container"
                        label="Preview"
                        gutter={16}
                        style={{ marginBottom: '1rem' }}
                      >
                        <div
                          className="preview"
                          style={{
                            textAlign: 'center',
                            color: textColour?.hex,
                            background: backgroundColour?.hex,
                            width: '110px',
                            padding: '0.5rem 1rem',
                            fontSize: '0.75rem',
                            border: '1px dotted black',
                          }}
                        >
                          Sample Text
                        </div>
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

export default RatingForm;
