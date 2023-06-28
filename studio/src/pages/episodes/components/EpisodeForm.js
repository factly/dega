import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Space,
  Radio,
  Row,
  Col,
  ConfigProvider,
  Collapse,
} from 'antd';
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

  const { Panel } = Collapse;

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
        style={{ padding: '0 1rem' }}
        initialValues={{ ...data }}
        name="create-category"
        className="edit-form"
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
        <Row justify="center" style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
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
                style={{ width: '100%', marginBottom: 16, background: '#f0f2f5', border: 0 }}
                defaultActiveKey={['1']}
                expandIconPosition="right"
                expandIcon={({ isActive }) => <Button>{isActive ? 'Close' : 'Expand'}</Button>}
              >
                <Panel header="Basic" key="1">
                  <Row style={{ background: '#F9FAFB', marginBottom: '1rem', gap: '1rem' }}>
                    <Col xs={24} md={10}>
                      <TitleInput onChange={(e) => onTitleChange(e.target.value)} />
                      <SlugInput />
                      <Form.Item name="podcast" label="Podcasts">
                        <Selector action="Podcasts" display="title" />
                      </Form.Item>
                      <DescriptionInput
                        inputProps={{
                          style: {
                            minHeight: '92px',
                            background: '#F9FAFB',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid rgba(0, 0, 0, 0.15)',
                          },
                        }}
                        rows={5}
                        initialValue={data.description_html}
                      />
                      <Form.Item>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item label="Season" name={'season'}>
                              <InputNumber
                                style={{ width: '100%', marginRight: 16 }}
                                placeholder="Input season"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Episode" name={'episode'}>
                              <InputNumber style={{ width: '100%' }} placeholder="Input episode" />
                            </Form.Item>
                          </Col>
                        </Row>
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
                      <Form.Item name="type" label="Type of Episode">
                        <Radio.Group defaultValue={'full'}>
                          <Radio.Button value="full">Full</Radio.Button>
                          <Radio.Button value="trailer">Trailer</Radio.Button>
                          <Radio.Button value="bonus">Bonus</Radio.Button>
                        </Radio.Group>
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
                  </Row>
                </Panel>
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

export default EpisodeForm;
