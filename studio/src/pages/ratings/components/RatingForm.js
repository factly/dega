import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Space, InputNumber, Col, Row } from 'antd';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import Editor from '../../../components/Editor';
import { SketchPicker } from 'react-color';
import MonacoEditor from '../../../components/MonacoEditor';
import getJsonValue from '../../../utils/getJsonValue';

const layout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 8,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

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
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  return (
    <Form
      {...layout}
      form={form}
      initialValues={{ ...data }}
      name="creat-rating"
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
      <Form.Item
        name="name"
        label="Rating"
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
      <Form.Item
        name="slug"
        label="Slug"
        rules={[
          {
            required: true,
            message: 'Please input the slug!',
          },
          {
            pattern: checker,
            message: 'Please enter valid slug!',
          },
        ]}
      >
        <Input />
      </Form.Item>
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
        <InputNumber min={1} />
      </Form.Item>
      <Form.Item name="medium_id" label="Featured Image">
        <MediaSelector />
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
            <div style={{ position: 'absolute', zIndex: '2', top: 0, left: '120px' }}>
              <div
                style={{ position: 'fixed', top: '0px', right: '0px', bottom: '0px', left: '0px' }}
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
            <div style={{ position: 'absolute', zIndex: '2', top: 0, left: '120px' }}>
              <div
                style={{ position: 'fixed', top: '0px', right: '0px', bottom: '0px', left: '0px' }}
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

      <Row className="preview-container" gutter={16} style={{ marginBottom: '1rem' }}>
        <Col span={10} style={{ textAlign: 'right' }}>
          Preview:
        </Col>
        <Col span={8}>
          <div
            className="preview"
            style={{
              textAlign: 'center',
              color: textColour?.hex,
              background: backgroundColour?.hex,
              width: '100px',
              padding: '0.5rem 1rem',
              border: '1px solid black',
            }}
          >
            Previews
          </div>
        </Col>
      </Row>

      <Form.Item name="description" label="Description">
        <Editor style={{ width: '600px' }} placeholder="Enter Description..." basic={true} />
      </Form.Item>
      <Form.Item name="meta_fields" label="Metafields">
        <MonacoEditor language="json" />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Space>
          <Button disabled={!valueChange} type="primary" htmlType="submit">
            {data && data.id ? 'Update' : 'Submit'}
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default RatingForm;
