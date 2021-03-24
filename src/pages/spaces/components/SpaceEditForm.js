import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Form, Input, Steps, Select } from 'antd';
import MediaSelector from '../../../components/MediaSelector';
import { checker } from '../../../utils/sluger';
import Editor from '../../../components/Editor';

const { Option } = Select;

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 8,
  },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const SpaceEditForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();
  const orgs = useSelector((state) => state.spaces.orgs);

  const onReset = () => {
    form.resetFields();
  };

  const [current, setCurrent] = React.useState(0);
  const [valueChange, setValueChange] = React.useState(false);

  return (
    <div>
      <Steps current={current} onChange={(value) => setCurrent(value)}>
        <Steps.Step title="Basic" />
        <Steps.Step title="Media" />
        <Steps.Step title="Contact" />
      </Steps>
      <Form
        {...layout}
        form={form}
        initialValues={data}
        name="create-space"
        onFinish={(values) => {
          onCreate(values);
          onReset();
        }}
        scrollToFirstError={true}
        onFinishFailed={(errors) => {
          setCurrent(0);
        }}
        onValuesChange={() => {
          setValueChange(true);
        }}
        style={{
          paddingTop: '24px',
        }}
      >
        <div style={current === 0 ? { display: 'block' } : { display: 'none' }}>
          <Form.Item label="Name">
            <Input.Group compact>
              <Form.Item
                name="organisation_id"
                noStyle
                rules={[{ required: true, message: 'Organisation is required' }]}
              >
                <Select style={{ width: '40%' }} placeholder="Select organisation">
                  {orgs.map((org) => (
                    <Option key={org.id} value={org.id}>
                      {org.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="name"
                noStyle
                rules={[
                  { required: true, message: 'Name is required' },
                  { min: 3, message: 'Name must be minimum 3 characters.' },
                  { max: 50, message: 'Name must be maximum 50 characters.' },
                ]}
              >
                <Input style={{ width: '60%' }} placeholder="Input name" />
              </Form.Item>
            </Input.Group>
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
                required: checker,
                message: 'Please enter valid slug!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="site_title" label="Title">
            <Input />
          </Form.Item>
          <Form.Item name="tag_line" label="Tag line">
            <Input />
          </Form.Item>
          <Form.Item name="site_address" label="Website">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Editor style={{ width: '600px' }} placeholder="Enter Description..." />
          </Form.Item>
        </div>
        <div style={current === 1 ? { display: 'block' } : { display: 'none' }}>
          <Form.Item label="Logo" name="logo_id">
            <MediaSelector />
          </Form.Item>
          <Form.Item label="Logo Mobile" name="logo_mobile_id">
            <MediaSelector />
          </Form.Item>
          <Form.Item label="Fav Icon" name="fav_icon_id">
            <MediaSelector />
          </Form.Item>
          <Form.Item label="Mobile Icon" name="mobile_icon_id">
            <MediaSelector />
          </Form.Item>
        </div>
        <div style={current === 2 ? { display: 'block' } : { display: 'none' }}>
          <Form.Item name={['social_media_urls', 'facebook']} label="Facebook">
            <Input style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name={['social_media_urls', 'twitter']} label="Twitter">
            <Input style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name={['social_media_urls', 'pintrest']} label="Pintrest">
            <Input style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name={['social_media_urls', 'instagram']} label="Instagram">
            <Input style={{ width: '100%' }} />
          </Form.Item>
        </div>
        <Form.Item>
          <Button disabled={current === 0} onClick={() => setCurrent(current - 1)}>
            Back
          </Button>
          {current < 2 ? (
            <Button disabled={current === 2} onClick={() => setCurrent(current + 1)}>
              Next
            </Button>
          ) : null}
          {current === 2 ? (
            <Button disabled={!valueChange} type="primary" htmlType="submit">
              Update
            </Button>
          ) : null}
        </Form.Item>
      </Form>
    </div>
  );
};

export default SpaceEditForm;
