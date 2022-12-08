import { Form, DatePicker, Button, Space, Select } from 'antd';
import React from 'react';
import { maker } from '../../utils/sluger';
import Selector from '../Selector';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { updatePost } from '../../actions/posts';
import { updatePage } from '../../actions/pages';
import { SlugInput, TitleInput } from '../FormItems';

function QuickEdit({ data, setID, slug, page = false, onQuickEditUpdate = () => {} }) {
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
        published_date: data.published_date ? dayjs(data.published_date) : null,
      }}
      style={{ marginTop: 10 }}
      onFinish={(values) => {
        values.category_ids = values.categories || [];
        values.tag_ids = values.tags || [];
        values.author_ids = values.authors || [];
        values.claim_ids = values.claims || [];
        values.status === 'publish'
          ? (values.published_date = values.published_date
              ? dayjs(values.published_date).format('YYYY-MM-DDTHH:mm:ssZ')
              : dayjs(Date.now()).format('YYYY-MM-DDTHH:mm:ssZ'))
          : (values.published_date = null);
        if (page) {
          dispatch(
            updatePage({
              ...data,
              ...values,
            }),
          ).then(() => {
            setID(0);
            onQuickEditUpdate();
          });
        } else {
          dispatch(
            updatePost({
              ...data,
              ...values,
            }),
          ).then(() => {
            setID(0);
            onQuickEditUpdate();
          });
        }
      }}
      onValuesChange={() => {
        setValueChange(true);
      }}
    >
      <TitleInput
        onChange={onTitleChange}
        type="textarea"
        inputProps={{ rows: 2, placeholder: 'Add title for the post' }}
      />
      <SlugInput />
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
        <Selector mode="multiple" display={'display_name'} action="Authors" />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Space>
          <Button
            onClick={() => {
              setID(0);
              onQuickEditUpdate();
            }}
          >
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" disabled={!valueChange}>
            Update
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default QuickEdit;
