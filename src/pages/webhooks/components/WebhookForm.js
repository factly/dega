import React from 'react';
import { Button, Form, Input, Space, Switch, Checkbox, Row, Col } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getEvents } from '../../../actions/events';
import deepEqual from 'deep-equal';

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 10,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

const buttonLayout = {
  wrapperCol: {
    offset: 2,
    span: 10,
  },
};
const WebhookForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = React.useState(false);
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  const { events, total, loading } = useSelector((state) => {
    let details = [];
    let ids = [];
    let total = 0;

    for (var i = 1; i <= filters.page; i++) {
      let j = state.events.req.findIndex((item) => deepEqual(item.query, { ...filters, page: i }));
      if (j > -1) {
        total = state.events.req[j].total;
        ids = ids.concat(state.events.req[j].data);
      }
    }
    details = ids.map((element) => state.events.details[element]);
    return { events: details, total: total, loading: state.events.loading };
  });

  const onReset = () => {
    form.resetFields();
  };
  const onSave = (values) => {
    values.event_ids = values.events || [];
    onCreate(values);
  };
  React.useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchEvents = () => {
    dispatch(getEvents(filters));
  };
  const getEventName = (eventLabel) => {
    var labelArr = eventLabel.split('.');
    for (var i = 0; i < labelArr.length; i++) {
      labelArr[i] = labelArr[i][0].toUpperCase() + labelArr[i].slice(1);
    }
    return labelArr.join(' ');
  };
  if (events) {
    return (
      <Form
        {...layout}
        form={form}
        initialValues={{ ...data }}
        name="create-webhook"
        onFinish={(values) => {
          onSave(values);
          onReset();
        }}
        onValuesChange={() => {
          setValueChange(true);
        }}
      >
        <Form.Item name="name" label="Name">
          <Input />
        </Form.Item>
        <Form.Item name="url" label="Url">
          <Input />
        </Form.Item>
        <Form.Item label="Enable" name="enabled" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="events" label="Events">
          <Checkbox.Group>
            <Row gutter={[4, 16]}>
              {events.map((event) => (
                <Col span={8} key={event.id}>
                  <Checkbox label={event.name} value={event.id}>
                    {getEventName(event.name)}
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item
          {...buttonLayout}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            onClick={() => {
              setFilters({ page: filters.page + 1, limit: filters.limit });
            }}
            size="small"
            style={{
              width: '90%',
            }}
          >
            Load More Events
          </Button>
        </Form.Item>
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
      </Form>
    );
  }
};

export default WebhookForm;
