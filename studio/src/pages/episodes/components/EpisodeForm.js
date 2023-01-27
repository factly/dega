import React, { useState } from 'react';
import { Button, Form, Input, InputNumber, Space, Radio } from 'antd';
import { maker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import Audio from './Audio';
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
const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

const EpisodeForm = ({ onCreate, data = {} }) => {
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

  const onSave = (values) => {
    if (values.podcast) {
      values.podcast_id = values.podcast;
    }
    onCreate(values);
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
        if (values.meta_fields) {
          values.meta_fields = getJsonValue(values.meta_fields);
        }
        onSave(values);
        onReset();
      }}
      onValuesChange={() => {
        setValueChange(true);
      }}
    >
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, marginRight: 10 }}>
          <TitleInput onChange={(e) => onTitleChange(e.target.value)} />
          <SlugInput />
          <Form.Item name="podcast" label="Podcasts">
            <Selector action="Podcasts" display="title" />
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
          <DescriptionInput
            inputProps={{ style: { width: '600px' }, placeholder: 'Enter Description...' }}
            initialValue={data.description?.html}
          />
          <MetaForm />
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
