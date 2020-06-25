import React from 'react';
import { Button, Form, Input, Steps, DatePicker } from 'antd';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Table from '@editorjs/table';
import Selector from '../../../components/Selector';
import { maker, checker } from '../../../utils/sluger';
import moment from 'moment';

const { TextArea } = Input;

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

const ClaimCreateForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();

  const onReset = () => {
    form.resetFields();
  };

  const [current, setCurrent] = React.useState(0);

  const editor = new EditorJS({
    holder: 'editorjs',
    tools: {
      header: Header,
      list: List,
      paragraph: Paragraph,
      quote: Quote,
      table: Table,
    },
    data: data.description,
  });

  const onSave = (values) => {
    editor
      .save()
      .then((outputData) => {
        values.claimant_id = values.claimant || [];
        values.rating_id = values.rating || 0;
        values.claim_date = values.claim_date
          ? moment(values.claim_date).format('YYYY-MM-DDTHH:mm:ssZ')
          : null;
        values.checked_date = values.checked_date
          ? moment(values.checked_date).format('YYYY-MM-DDTHH:mm:ssZ')
          : null;

        onCreate({
          ...values,
          description: outputData,
        });
      })
      .catch((error) => {
        console.log('Saving failed: ', error);
      });
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  if (data.id) {
    data.claim_date = data.claim_date ? moment(data.claim_date) : null;
    data.checked_date = data.checked_date ? moment(data.claim_date) : null;
  }

  return (
    <div>
      <Steps current={current} onChange={(value) => setCurrent(value)}>
        <Steps.Step title="Basic" />
        <Steps.Step title="Media" />
      </Steps>
      <Form
        {...layout}
        form={form}
        initialValues={data}
        name="create-claim"
        onFinish={(values) => {
          onSave(values);
          onReset();
        }}
        style={{
          paddingTop: '24px',
        }}
        layout="vertical"
      >
        <div style={current === 0 ? { display: 'block' } : { display: 'none' }}>
          <Form.Item name="title" label="Title">
            <Input placeholder="title" onChange={(e) => onTitleChange(e.target.value)} />
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
                message: 'Slug can not have whitespaces!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="claimant" label="Claimants">
            <Selector action="Claimants" />
          </Form.Item>
          <Form.Item name="rating" label="Ratings">
            <Selector action="Ratings" />
          </Form.Item>
          <Form.Item label="Description">
            <div id="editorjs" style={{ border: '1px solid black', width: '800px' }}></div>
          </Form.Item>
        </div>
        <div style={current === 1 ? { display: 'block' } : { display: 'none' }}>
          <Form.Item name="claim_date" label="Claim Date">
            <DatePicker />
          </Form.Item>
          <Form.Item name="checked_date" label="Checked Date">
            <DatePicker />
          </Form.Item>
          <Form.Item name="claim_sources" label="Claim Sources">
            <TextArea />
          </Form.Item>
          <Form.Item name="review" label="Review">
            <TextArea />
          </Form.Item>
          <Form.Item name="review_tag_line" label="Review Tagline">
            <TextArea />
          </Form.Item>
          <Form.Item name="review_sources" label="Review Sources">
            <TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </div>
        <Form.Item>
          <Button disabled={current === 0} onClick={() => setCurrent(current - 1)}>
            Back
          </Button>
          <Button disabled={current === 1} onClick={() => setCurrent(current + 1)}>
            Next
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ClaimCreateForm;
