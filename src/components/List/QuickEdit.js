import { Form, Input, DatePicker, Button, Space, Select } from 'antd';
import React from 'react';
import { checker, maker } from '../../utils/sluger';
import Selector from '../Selector';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { updatePost } from '../../actions/posts';
import { updatePage } from '../../actions/pages';

function QuickEdit({ data, setID, slug, page = false }) {
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = React.useState(false);
  const dispatch = useDispatch();
  const onTitleChange = (e) => {
    if (form.getFieldValue('status') !== 'publish') {
      form.setFieldsValue({
        slug: maker(e.target.value),
      });
    }
  };
  const layout = {
    labelCol: {
      span: 3,
    },
    wrapperCol: {
      span: 12,
    },
  };

  const tailLayout = {
    wrapperCol: {
      offset: 6,
      span: 14,
    },
  };
  return (
    <Form
      {...layout}
      form={form}
      initialValues={{
        ...data,
        published_date: data.published_date ? moment(data.published_date) : null,
      }}
      style={{ marginTop: 10 }}
      onFinish={(values) => {
        values.category_ids = values.categories || [];
        values.tag_ids = values.tags || [];
        values.author_ids = values.authors || [];
        values.claim_ids = values.claims || [];
        values.status === 'publish'
          ? (values.published_date = values.published_date
              ? moment(values.published_date).format('YYYY-MM-DDTHH:mm:ssZ')
              : moment(Date.now()).format('YYYY-MM-DDTHH:mm:ssZ'))
          : (values.published_date = null);
        if (page) {
          dispatch(
            updatePage({
              ...data,
              ...values,
            }),
          ).then(() => setID(0));
        } else {
          dispatch(
            updatePost({
              ...data,
              ...values,
            }),
          ).then(() => setID(0));
        }
      }}
      onValuesChange={() => {
        setValueChange(true);
      }}
    >
      <Form.Item
        name="title"
        label="Title"
        rules={[
          {
            required: true,
            message: 'Please input the title!',
          },
          { min: 3, message: 'Title must be minimum 3 characters.' },
          { max: 150, message: 'Title must be maximum 150 characters.' },
        ]}
      >
        <Input.TextArea onChange={onTitleChange} rows={2} placeholder="Add title for the post" />
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
      <Form.Item name="status" label="Status">
        <Select style={{ maxWidth: '160px' }}>
          <Select.Option value="publish">Published</Select.Option>
          <Select.Option value="draft">Draft</Select.Option>
          <Select.Option value="ready">Ready to Publish</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="published_date" label="Published Date">
        <DatePicker />
      </Form.Item>
      {slug === 'fact-check' ? (
        <Form.Item name="claims" label="Claims">
          <Selector mode="multiple" display={'claim'} action="Claims" />
        </Form.Item>
      ) : null}
      <Form.Item name="categories" label="Categories">
        <Selector mode="multiple" action="Categories" createEntity="Category" />
      </Form.Item>

      <Form.Item name="tags" label="Tags">
        <Selector mode="multiple" action="Tags" createEntity="Tag" />
      </Form.Item>
      <Form.Item name="authors" label="Authors">
        <Selector mode="multiple" display={'email'} action="Authors" />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Space>
          <Button type="primary" onClick={() => setID(0)}>
            Cancel
          </Button>
          <Button htmlType="submit" disabled={!valueChange}>
            Update
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default QuickEdit;
