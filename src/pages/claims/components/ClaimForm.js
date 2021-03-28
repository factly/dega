import React from 'react';
import { Button, Form, Input, Steps, DatePicker, Space } from 'antd';
import Selector from '../../../components/Selector';
import Editor from '../../../components/Editor';
import { maker, checker } from '../../../utils/sluger';
import moment from 'moment';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 6,
  },
};

const ClaimForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = React.useState(false);

  const onReset = () => {
    form.resetFields();
  };

  const [current, setCurrent] = React.useState(0);

  const onSave = (values) => {
    values.claimant_id = values.claimant || [];
    values.rating_id = values.rating || 0;
    values.claim_date = values.claim_date
      ? moment(values.claim_date).format('YYYY-MM-DDTHH:mm:ssZ')
      : null;
    values.checked_date = values.checked_date
      ? moment(values.checked_date).format('YYYY-MM-DDTHH:mm:ssZ')
      : null;

    onCreate(values);
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  if (data && data.id) {
    data.claim_date = data.claim_date ? moment(data.claim_date) : null;
    data.checked_date = data.checked_date ? moment(data.claim_date) : null;
  }

  return (
    <div>
      <Steps current={current} onChange={(value) => setCurrent(value)}>
        <Steps.Step title="Basic" />
        <Steps.Step title="Sources" />
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
        onFinishFailed={(errors) => {
          if (errors.errorFields[0].name[0] !== 'review_sources') {
            setCurrent(0);
          }
        }}
        onValuesChange={() => {
          setValueChange(true);
        }}
        scrollToFirstError={true}
        style={{
          paddingTop: '24px',
        }}
        layout="vertical"
      >
        <div style={current === 0 ? { display: 'block' } : { display: 'none' }}>
          <Form.Item
            name="title"
            label="Claim"
            rules={[
              {
                required: true,
                message: 'Please input the title!',
              },
              { min: 3, message: 'Title must be minimum 3 characters.' },
              { max: 150, message: 'Title must be maximum 150 characters.' },
            ]}
          >
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
                message: 'Please enter valid slug!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="claimant"
            label="Claimants"
            rules={[
              {
                required: true,
                message: 'Please add claimant!',
              },
            ]}
          >
            <Selector action="Claimants" />
          </Form.Item>

          <Form.Item
            name="rating"
            label="Ratings"
            rules={[
              {
                required: true,
                message: 'Please add rating!',
              },
            ]}
          >
            <Selector action="Ratings" />
          </Form.Item>

          <Form.Item name="review" label="Fact" wrapperCol={24}>
            <Editor placeholder="Enter Review..." />
          </Form.Item>

          <Form.Item name="description" label="Description" wrapperCol={24}>
            <Editor placeholder="Enter Description..." />
          </Form.Item>
        </div>
        <div style={current === 1 ? { display: 'block' } : { display: 'none' }}>
          <Form.Item name="claim_date" label="Claim Date">
            <DatePicker />
          </Form.Item>
          <Form.Item name="checked_date" label="Checked Date">
            <DatePicker />
          </Form.Item>
          <Form.List name="claim_sources" label="Claim sources">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} style={{ marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...field}
                      name={[field.name, 'url']}
                      fieldKey={[field.fieldKey, 'url']}
                      rules={[{ required: true, message: 'Url required' }]}
                      wrapperCol={24}
                      label="URL"
                    >
                      <Input placeholder="Enter url" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'description']}
                      fieldKey={[field.fieldKey, 'description']}
                      rules={[{ required: true, message: 'Description required' }]}
                      wrapperCol={24}
                      label="Description"
                    >
                      <Input placeholder="Enter description" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Claim sources
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.List name="review_sources" label="Review sources">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} style={{ marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...field}
                      name={[field.name, 'url']}
                      fieldKey={[field.fieldKey, 'url']}
                      rules={[{ required: true, message: 'Url required' }]}
                      wrapperCol={24}
                      label="URL"
                    >
                      <Input placeholder="Enter url" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'description']}
                      fieldKey={[field.fieldKey, 'description']}
                      rules={[{ required: true, message: 'Description required' }]}
                      wrapperCol={24}
                      label="Description"
                    >
                      <Input placeholder="Enter description" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Review sources
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>
        <Form.Item>
          <Button disabled={current === 0} onClick={() => setCurrent(current - 1)}>
            Back
          </Button>
          {current < 1 ? <Button onClick={() => setCurrent(current + 1)}>Next</Button> : null}
          {current === 1 ? (
            <Button disabled={!valueChange} type="primary" htmlType="submit">
              {data && data.id ? 'Update' : 'Submit'}
            </Button>
          ) : null}
        </Form.Item>
      </Form>
    </div>
  );
};

export default ClaimForm;
