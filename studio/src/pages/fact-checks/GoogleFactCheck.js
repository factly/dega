import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SearchOutlined } from '@ant-design/icons';
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
  const [currPageToken, setCurrPageToken] = React.useState('');
  const [paginationStack, setPaginationStack] = React.useState([]);
  const [indexPointer, setIndexPointer] = React.useState(null);

  const { factChecks, loading, nextPage } = useSelector(({ googleFactChecks }) => {
    const node = googleFactChecks.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node) {
      return {
        factChecks: node.data,
        total: node.total,
        loading: googleFactChecks.loading,
        nextPage: node.nextPage,
      };
    }
    return { factChecks: [], total: 0, loading: googleFactChecks.loading, nextPage: '' };
  });

  const fetchFactChecks = (values) => {
    dispatch(getGoogleFactChecks(values));
  };

  const onSubmit = (values) => {
    if (values.language === 'all') {
      delete values.language;
    }
    setCurrPageToken('');
    setIndexPointer(null);
    setPaginationStack([]);
    setQuery({ ...{ page: 1 }, ...values });
  };

  React.useEffect(() => {
    if (filters.query) fetchFactChecks(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  React.useEffect(() => {
    if (!paginationStack.includes(currPageToken))
      setPaginationStack((paginationStack) => [...paginationStack, currPageToken]);
  }, [paginationStack, currPageToken]);

  const onLoadMore = () => {
    indexPointer + 1 === paginationStack.length
      ? setIndexPointer(paginationStack.length)
      : setIndexPointer(indexPointer + 1);
    setCurrPageToken(nextPage);
    setQuery({ ...filters, pageToken: nextPage });
  };
  const loadPrevious = () => {
    const prev = paginationStack[indexPointer - 1];
    setIndexPointer(indexPointer - 1);
    setQuery({ ...filters, pageToken: prev });
  };

  const loadMore = !loading ? (
    <div
      style={{
        float: 'right',
        paddingBlock: '10px',
      }}
    >
      <Space direction="horizontal">
        <Button disabled={indexPointer === null || indexPointer === 0} onClick={loadPrevious}>
          Back
        </Button>
        <Button disabled={!nextPage || nextPage === ''} onClick={onLoadMore}>
          Next
        </Button>
      </Space>
    </div>
  ) : null;

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
          rules={[
            {
              required: true,
              message: 'Please enter your search query!',
            },
          ]}
          style={{ width: '20%' }}
        >
          <Input
            prefix={<SearchOutlined style={{ color: '#000000E0', fontSize: '16px', paddingRight: 8 }} />}
            placeholder="Search fact checks"
          />
        </Form.Item>
        <Form.Item name="language" label="Language" style={{ width: '15%' }}>
          <Select defaultValue={'all'} >
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
        loadMore={loadMore}
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
