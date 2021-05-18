import React from 'react';
import { Button, Form, Input, Steps, DatePicker, Row, Col, Divider } from 'antd';
import Selector from '../../../components/Selector';
import Editor from '../../../components/Editor';
import { maker, checker } from '../../../utils/sluger';
import moment from 'moment';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const layout = {
  labelCol: {
    span: 8,
    offset: 2,
  },
  wrapperCol: {
    span: 20,
    offset: 2,
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

  const onClaimChange = (string) => {
    if (string.length > 150) {
      form.setFieldsValue({
        slug: maker(string.substring(0, 150)),
      });
    } else {
      form.setFieldsValue({
        slug: maker(string),
      });
    }
  };

  if (data && data.id) {
    data.claim_date = data.claim_date ? moment(data.claim_date) : null;
    data.checked_date = data.checked_date ? moment(data.checked_date) : null;
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
            name="claim"
            label="Claim"
            rules={[
              {
                required: true,
                message: 'Please input the Claim!',
              },
              { min: 3, message: 'Claim must be minimum 3 characters.' },
              { max: 5000, message: 'Claim must be maximum 5000 characters.' },
            ]}
          >
            <Input.TextArea
              rows={6}
              placeholder="Enter claim...."
              onChange={(e) => onClaimChange(e.target.value)}
            />
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
              { max: 150, message: 'Slug must be maximum 150 characters.' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="fact" label="Fact">
            <Editor placeholder="Enter Fact..." basic={true} />
          </Form.Item>
          <Form.Item
            name="claimant"
            label="Claimant"
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
            label="Rating"
            rules={[
              {
                required: true,
                message: 'Please add rating!',
              },
            ]}
          >
            <Selector action="Ratings" />
          </Form.Item>

          <Form.Item name="description" label="Description">
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
          <Form.Item label="Claim Sources">
            <Form.List name="claim_sources" label="Claim sources">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Row style={{ justifyContent: 'center', alignItems: 'baseline' }} gutter={13}>
                      <Col span={11}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'url']}
                          fieldKey={[field.fieldKey, 'url']}
                          rules={[{ required: true, message: 'Url required' }]}
                          wrapperCol={24}
                        >
                          <Input placeholder="Enter url" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'description']}
                          fieldKey={[field.fieldKey, 'description']}
                          rules={[{ required: true, message: 'Description required' }]}
                          wrapperCol={24}
                        >
                          <Input placeholder="Enter description" />
                        </Form.Item>
                      </Col>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Row>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Claim sources
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item label="Review Sources">
            <Form.List name="review_sources" label="Review sources">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Row style={{ justifyContent: 'center', alignItems: 'baseline' }} gutter={13}>
                      <Col span={11}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'url']}
                          fieldKey={[field.fieldKey, 'url']}
                          rules={[{ required: true, message: 'Url required' }]}
                          wrapperCol={24}
                        >
                          <Input placeholder="Enter url" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'description']}
                          fieldKey={[field.fieldKey, 'description']}
                          rules={[{ required: true, message: 'Description required' }]}
                          wrapperCol={24}
                        >
                          <Input placeholder="Enter description" />
                        </Form.Item>
                      </Col>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Row>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Review sources
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
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
