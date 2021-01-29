import React from 'react';
import { Row, Col, Form, Input, Button, Space, Select } from 'antd';
import Editor from '../../../components/Editor';
import Selector from '../../../components/Selector';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import { useDispatch } from 'react-redux';
import { addTemplate } from '../../../actions/posts';
import { useHistory } from 'react-router-dom';

function PostForm({ onCreate, data = {}, actions = {} }) {
  const history = useHistory();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { Option } = Select;

  if (!data.status) data.status = 'draft';

  const onSave = (values) => {
    values.category_ids = values.categories || [];
    values.tag_ids = values.tags || [];
    values.format_id = 1;
    values.author_ids = values.authors || [];
    onCreate(values);
  };

  const onTitleChange = (string) => {
    if (form.getFieldValue('status') !== 'publish') {
      form.setFieldsValue({
        slug: maker(string),
      });
    }
  };

  const createTemplate = () => {
    dispatch(addTemplate({ post_id: parseInt(data.id) })).then(() => history.push('/posts'));
  };

  return (
    <>
      <Form
        form={form}
        initialValues={{ ...data }}
        style={{ maxWidth: '100%', width: '100%' }}
        onFinish={(values) => onSave(values)}
        layout="vertical"
      >
        <Space direction="vertical">
          <div style={{ float: 'right' }}>
            <Space direction="horizontal">
              {data.id ? (
                <Form.Item name="template">
                  <Button type="secondary" onClick={createTemplate}>
                    Create Template
                  </Button>
                </Form.Item>
              ) : null}
              <Form.Item name="status">
                <Button type="secondary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Space>
          </div>
          <Row gutter={16}>
            <Col span={18}>
              <Form.Item
                name="title"
                rules={[
                  {
                    required: true,
                    message: 'Please input the title!',
                  },
                  { min: 3, message: 'Title must be minimum 3 characters.' },
                  { max: 150, message: 'Title must be maximum 150 characters.' },
                ]}
              >
                <Input.TextArea
                  bordered={false}
                  placeholder="Add title for the post"
                  onChange={(e) => onTitleChange(e.target.value)}
                  style={{ fontSize: 'large', fontWeight: 'bold' }}
                />
              </Form.Item>
              <Form.Item
                name="excerpt"
                rules={[
                  { min: 3, message: 'Title must be minimum 3 characters.' },
                  { max: 5000, message: 'Excerpt must be a maximum of 5000 characters.' },
                ]}
              >
                <Input.TextArea
                  bordered={false}
                  rows={4}
                  placeholder="Excerpt"
                  style={{ fontSize: 'medium' }}
                />
              </Form.Item>
              <Form.Item name="description">
                <Editor />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Status" name="status">
                <Select>
                  <Option key={'draft'} value={'draft'}>
                    Draft
                  </Option>
                  {actions.includes('admin') || actions.includes('publish') ? (
                    <Option key={'publish'} value={'publish'}>
                      Publish
                    </Option>
                  ) : null}
                </Select>
              </Form.Item>
              <Form.Item name="featured_medium_id" label="Featured Image">
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
                <Selector mode="multiple" action="Categories" createEntity="Category" />
              </Form.Item>

              <Form.Item name="tags" label="Tags">
                <Selector mode="multiple" action="Tags" createEntity="Tag" />
              </Form.Item>

              <Form.Item name="authors" label="Authors">
                <Selector mode="multiple" display={'email'} action="Authors" />
              </Form.Item>
            </Col>
          </Row>
        </Space>
      </Form>
    </>
  );
}

export default PostForm;
