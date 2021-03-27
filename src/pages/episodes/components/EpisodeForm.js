import React, { useState } from 'react';
import { Button, Form, Input, InputNumber, Space, Radio } from 'antd';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import Editor from '../../../components/Editor';
import Audio from './Audio';

const layout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

const EpisodeForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = React.useState(false);

  const onReset = () => {
    form.resetFields();
  };

  const [url, setURL] = useState(data?.audio_url);

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  return (
    <Form
      {...layout}
      layout="vertical"
      form={form}
      initialValues={{ ...data }}
      name="create-category"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
      onValuesChange={() => {
        setValueChange(true);
      }}
    >
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, marginRight: 10 }}>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
                message: 'Please enter the title!',
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
          <Form.Item>
            <Input.Group compact>
              <Form.Item label="Season" name={'season'}>
                <InputNumber style={{ width: '100%' }} placeholder="Input season" />
              </Form.Item>
              <Form.Item label="Episode" name={'episode'}>
                <InputNumber style={{ width: '100%' }} placeholder="Input episode" />
              </Form.Item>
            </Input.Group>
          </Form.Item>
          <Form.Item name="type" label="Type of Episode">
            <Radio.Group defaultValue={'full'}>
              <Radio.Button value="full">Full</Radio.Button>
              <Radio.Button value="trailer">Trailer</Radio.Button>
              <Radio.Button value="bonus">Bonus</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Editor style={{ width: '600px' }} placeholder="Enter Description..." />
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
        </div>
        <div style={{ flex: 1, alignItems: 'center' }}>
          <Form.Item label="Featured Image" name="medium_id">
            <MediaSelector />
          </Form.Item>
          <Form.Item name="audio_url" label="Audio">
            <Audio
              onUpload={(value) => {
                setURL(value);
                form.setFieldsValue({
                  audio_url: value,
                });
              }}
              url={url}
            />
          </Form.Item>
        </div>
      </div>
    </Form>
  );
};

export default EpisodeForm;
