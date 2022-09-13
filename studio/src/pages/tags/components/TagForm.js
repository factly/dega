import React, { useState } from 'react';
import { Button, Form, Space, Switch, Row, Col } from 'antd';
import { maker } from '../../../utils/sluger';
import getJsonValue from '../../../utils/getJsonValue';
import MediaSelector from '../../../components/MediaSelector';
import { SketchPicker } from 'react-color';
import { DescriptionInput, MetaForm, SlugInput, TitleInput } from '../../../components/FormItems';

const TagForm = ({ onCreate, data = {} }) => {
  if (data && data.meta_fields) {
    if (typeof data.meta_fields !== 'string') {
      data.meta_fields = JSON.stringify(data.meta_fields);
    }
  }
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

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  return (
    <>
      <Form
        form={form}
        initialValues={{ ...data }}
        name="create-tag"
        layout="vertical"
        onFinish={(values) => {
          if (values.meta_fields) {
            values.meta_fields = getJsonValue(values.meta_fields);
          }
          values.background_colour = backgroundColour;
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
            <Row
              gutter={40}
              justify="space-around"
              style={{ background: '#f0f2f5', padding: '1.25rem', marginBottom: '1rem' }}
            >
              <Col span={12}>
                <TitleInput
                  name="name"
                  label="Tag Name"
                  onChange={(e) => onTitleChange(e.target.value)}
                />
                <SlugInput />
                <Form.Item label="Featured" name="is_featured" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item name="background_colour" label="Colour">
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
                      <div style={{ position: 'absolute', zIndex: '2', top: 0, left: '120px' }}>
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
              <Col span={10}>
                <Form.Item label="Featured Image" name="medium_id">
                  <MediaSelector maxWidth={'350px'} containerStyles={{ justifyContent: 'start' }} />
                </Form.Item>
              </Col>
              <Col span={12} style={{ marginRight: 'auto', marginLeft: '20px' }}>
                <DescriptionInput
                  type="editor"
                  inputProps={{
                    style: { width: '600px', background: '#fff', padding: '0.5rem 0.75rem' },
                    placeholder: 'Enter Description...',
                    basic: true,
                  }}
                  initialValue={data.description?.json}
                />
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={40} style={{ background: '#f0f2f5' }}>
              <MetaForm />
            </Row>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default TagForm;
