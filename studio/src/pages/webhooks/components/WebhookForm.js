import React from 'react';
import { Button, Form, Input, Switch, Checkbox, Row, Col, ConfigProvider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getEvents } from '../../../actions/events';
import deepEqual from 'deep-equal';
import { getEventName } from '../../../utils/event';

const WebhookForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = React.useState(false);
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  const { events } = useSelector((state) => {
    let details = [];
    let ids = [];

    for (let i = 1; i <= filters.page; i++) {
      let j = state.events.req.findIndex((item) => deepEqual(item.query, { ...filters, page: i }));
      if (j > -1) {
        ids = ids.concat(state.events.req[j].data);
      }
    }
    details = ids.map((element) => state.events.details[element]);
    return { events: details };
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
  if (events) {
    return (
      <ConfigProvider
        theme={{
          components: {
            Form: {
              marginLG: 12,
            },
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
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
          <Row justify={'end'}>
            <Form.Item>
              <Button disabled={!valueChange} type="primary" htmlType="submit">
                {data && data.id ? 'Update' : 'Submit'}
              </Button>
            </Form.Item>
          </Row>
          <Row gutter={[4, 16]}>
            <Col span={8}>
              <Form.Item name="name" label="Name">
                <Input />
              </Form.Item>
              <Form.Item name="url" label="Url">
                <Input />
              </Form.Item>
              <Form.Item name="enabled" valuePropName="checked">
                <Row justify={'space-between'}>
                  <span>Enabled</span>
                  <Switch />
                </Row>
              </Form.Item>
              <Form.Item name="podcast" valuePropName="checked">
                <Row justify={'space-between'}>
                  <span>Podcast</span>
                  <Switch />
                </Row>
              </Form.Item>
              <Form.Item name="events" label="Events">
                <Checkbox.Group>
                  <Row gutter={[4, 12]} justify={'start'}>
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
                style={{
                  display: 'flex',
                  justifyContent: 'start',
                  alignItems: 'center',
                }}
              >
                <Button
                  onClick={() => {
                    setFilters({ page: filters.page + 1, limit: filters.limit });
                  }}
                >
                  Load More Events
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </ConfigProvider>
    );
  }
};

export default WebhookForm;
