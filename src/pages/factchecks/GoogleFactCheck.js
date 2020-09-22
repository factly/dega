import React from 'react';
import { useDispatch } from 'react-redux';
import { getFactChecks } from '../../actions/factchecks';

function GoogleFactCheck() {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [query, setQuery] = React.useState('');

  const onSubmit = (values) => {
    setQuery(values.search_string);
    fetchFactChecks(1, query);
  };

  const fetchFactChecks = (page, query) => {
    dispatch(getFactChecks({ page, query }));
  };

  return (
    <div style={{}}>
      <Form
        {...layout}
        form={form}
        initialValues={{ ...data }}
        name="google-fact-check"
        onFinish={(values) => {
          onSubmit(values);
          onReset();
        }}
      >
        <Form.Item
          name="Fact Check Explorer"
          label="search_string"
          rules={[
            {
              required: true,
              message: 'Please enter your search query!',
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
      <SearchResults getNextPage={(page) => fetchFactChecks(page, query)} />
    </div>
  );
}

export default GoogleFactCheck;
