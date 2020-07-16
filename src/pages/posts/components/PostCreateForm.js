import React from 'react';
import { Row, Col, Form, Input, Button, Space, Statistic } from 'antd';
import Editor from '../../../components/Editor';
import Selector from '../../../components/Selector';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import moment from 'moment';
import { SaveOutlined, ToTopOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

function CreatePost({ onCreate, data = {} }) {
  const [form] = Form.useForm();

  const formats = useSelector((state) => state.formats.details);

  const [claimHide, setClaimHide] = React.useState(
    data.format && formats[data.format] && formats[data.format].slug === 'factcheck' ? false : true,
  );

  const onSave = (values) => {
    values.category_ids = values.categories || [];
    values.tag_ids = values.tags || [];
    values.format_id = values.format || 0;
    values.author_ids = values.authors || [];
    values.claim_ids = values.claims || [];
    values.published_date = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    onCreate(values);
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  return (
    <Form
      form={form}
      initialValues={{ ...data }}
      style={{ maxWidth: '100%', width: '100%' }}
      onFinish={(values) => onSave(values)}
      layout="vertical"
      onValuesChange={(changedValues, allValues) => {
        if (changedValues.format) {
          const flag =
            form.getFieldValue('format') &&
            formats[form.getFieldValue('format')] &&
            formats[form.getFieldValue('format')].slug === 'factcheck';

          setClaimHide(!flag);
        }
      }}
    >
      <Space direction="vertical">
        <Form.Item name="status" style={{ float: 'right' }}>
          <Input.Group compact>
            <Button
              type="secondary"
              htmlType="submit"
              icon={<SaveOutlined />}
              onClick={() =>
                form.setFieldsValue({
                  status: 'Draft',
                })
              }
            >
              Draft
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              icon={<ToTopOutlined />}
              onClick={() =>
                form.setFieldsValue({
                  status: 'Publish',
                })
              }
            >
              Publish
            </Button>
          </Input.Group>
        </Form.Item>
        <Row gutter={16}>
          <Col span={18}>
            <Form.Item
              name="title"
              label="Title"
              rules={[
                {
                  required: true,
                  message: 'Please input the title!',
                },
              ]}
            >
              <Input placeholder="title" onChange={(e) => onTitleChange(e.target.value)} />
            </Form.Item>
            <Form.Item
              name="excerpt"
              label="Excerpt"
              rules={[
                {
                  required: true,
                  message: 'Please input excerpt!',
                },
              ]}
            >
              <Input.TextArea rows={4} placeholder="excerpt" />
            </Form.Item>
            <Form.Item name="claims" label="Claims" hidden={claimHide}>
              <Selector mode="multiple" display={'title'} action="Claims" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Editor />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Status" name="status">
              {data.status ? <Statistic /> : null}
            </Form.Item>
            <Form.Item name="featured_medium_id" label="Image">
              <MediaSelector />
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
            <Form.Item name="categories" label="Categories">
              <Selector mode="multiple" action="Categories" />
            </Form.Item>
            <Form.Item name="tags" label="Tags">
              <Selector mode="multiple" action="Tags" />
            </Form.Item>
            <Form.Item
              name="format"
              label="Formats"
              rules={[
                {
                  required: true,
                  message: 'Please add format!',
                },
              ]}
            >
              <Selector action="Formats" />
            </Form.Item>
            <Form.Item name="authors" label="Authors">
              <Selector mode="multiple" display={'email'} action="Authors" />
            </Form.Item>
          </Col>
        </Row>
      </Space>
    </Form>
  );
}

export default CreatePost;
