import React from 'react';
import { Button, Form, Space, Row, Col, Select } from 'antd';
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
const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
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
    <Form
      {...layout}
      layout="vertical"
      form={form}
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
      <Row>
        <Col span={12}>
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
        </Col>
        <Col offset={4} span={6}>
          <Form.Item label="Featured Image" name="medium_id">
            <MediaSelector />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default PodcastForm;
