import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getGoogleFactChecks } from '../../actions/googleFactChecks';
import { Form, Input, Select, Button, List, Typography, Space } from 'antd';
import deepEqual from 'deep-equal';
import { languageCode } from '../fact-checks/LanguageCode';

function GoogleFactCheck() {
  const dispatch = useDispatch();
  const { Option } = Select;
  const [form] = Form.useForm();
  const langCode = languageCode();
  const [filters, setQuery] = React.useState({
    page: 1,
    query: 'factcheck',
  });

  const { factChecks, total, loading } = useSelector(({ googleFactChecks }) => {
    const node = googleFactChecks.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        factChecks: node.data,
        total: node.total,
        loading: googleFactChecks.loading,
      };
    return { factChecks: [], total: 0, loading: googleFactChecks.loading };
  });

  const fetchFactChecks = (values) => {
    dispatch(getGoogleFactChecks(values));
  };

  const onSubmit = (values) => {
    if (values.language === 'all') {
      delete values.language;
    }
    setQuery({ ...filters, ...values });
  };

  React.useEffect(() => {
    if (filters.query) fetchFactChecks(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <Space direction={'vertical'}>
      <Form
        form={form}
        name="google-fact-check"
        layout="inline"
        onFinish={(values) => {
          onSubmit(values);
        }}
        style={{ maxWidth: '100%' }}
      >
        <Form.Item
          name="query"
          label="Search"
          rules={[
            {
              required: true,
              message: 'Please enter your search query!',
            },
          ]}
          style={{ width: '25%' }}
        >
          <Input placeholder="search fact checks" />
        </Form.Item>
        <Form.Item name="language" label="language" style={{ width: '25%' }}>
          <Select defaultValue={'all'}>
            {langCode.map((e, key) => {
              return (
                <Option key={key} value={e.code}>
                  {e.language}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      <List
        bordered
        className="google-fact-check-search-list"
        loading={loading}
        itemLayout="vertical"
        dataSource={factChecks}
        pagination={{
          total: total,
          current: filters.page,
          pageSize: 10,
          onChange: (pageNumber, pageSize) => setQuery({ ...filters, page: pageNumber }),
        }}
        renderItem={(item) => (
          <List.Item key={item.text}>
            <Typography.Title level={5}>{`Claim by ${item.claimant}:`}</Typography.Title>
            <Typography.Title level={4}>{item.text}</Typography.Title>
            {item.claimReview.map((each) => (
              <>
                <Typography>
                  <b>{each.publisher.name}</b> rating : <b>{each.textualRating}</b>
                </Typography>
                <a href={each.url} target={'blank'}>
                  {each.title}
                </a>
              </>
            ))}
          </List.Item>
        )}
      />
    </Space>
  );
}

export default GoogleFactCheck;
