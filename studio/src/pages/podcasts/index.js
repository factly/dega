/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import PodcastList from './components/PodcastList';
import { Space, Button, Form, Row, Col, Input, Select } from 'antd';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import getUserPermission from '../../utils/getUserPermission';
import { getPodcasts } from '../../actions/podcasts';
import deepEqual from 'deep-equal';
import getUrlParams from '../../utils/getUrlParams';
import Selector from '../../components/Selector';

function Podcasts({ permission }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'podcasts', action: 'get', spaces });
  const dispatch = useDispatch();
  const history = useHistory();
  const query = new URLSearchParams(useLocation().search);

  const keys = ['page', 'limit', 'q', 'sort', 'category', 'language'];
  const params = getUrlParams(query, keys);
  const [filters, setFilters] = React.useState({
    ...params,
  });

  const pathName = useLocation().pathname;
  let searchFilter = new URLSearchParams(useLocation().search);

  useEffect(() => {
    keys.forEach((key) => {
      if (searchFilter.has(key)) {
        searchFilter.delete(key);
      }
    });
    Object.keys(filters).forEach(function (key) {
      if (key === 'category') {
        searchFilter.delete(key);
        filters[key].map((each) => {
          return searchFilter.append(key, each);
        });
      } else {
        searchFilter.set(key, filters[key]);
      }
    });
    history.push({
      pathname: pathName,
      search: '?' + searchFilter.toString(),
    });
  }, [history, filters]);

  const [form] = Form.useForm();
  const { Option } = Select;

  const { podcasts, total, loading } = useSelector((state) => {
    const node = state.podcasts.req.find((item) => {
      return deepEqual(item.query, params);
    });

    if (node)
      return {
        podcasts: node.data.map((element) => state.podcasts.details[element]),
        total: node.total,
        loading: state.podcasts.loading,
      };
    return { podcasts: [], total: 0, loading: state.podcasts.loading };
  });

  React.useEffect(() => {
    fetchPodcasts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchPodcasts = () => {
    dispatch(getPodcasts(filters));
  };
  const onSave = (values) => {
    let filterValue = {};
    if (values.language === 'all') {
      values.language = null;
    }
    Object.keys(values).forEach(function (key) {
      if (values[key]) {
        if (key === 'category') {
          if (values[key].length > 0) {
            filterValue[key] = values[key];
          }
        } else {
          filterValue[key] = values[key];
        }
      }
    });
    setFilters(filterValue);
  };

  return (
    <Space direction="vertical">
      <Form
        initialValues={filters}
        form={form}
        name="filters"
        onFinish={(values) => onSave(values)}
        style={{ maxWidth: '100%' }}
        onValuesChange={(changedValues, allValues) => {
          if (!changedValues.q) {
            onSave(allValues);
          }
        }}
      >
        <Row gutter={24} justify="end">
          <Col key={2} style={{ display: 'flex', justifyContent: 'end' }}>
            <Form.Item name="q">
              <Input placeholder="search podcasts" />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Search</Button>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="sort">
              <Select defaultValue="desc">
                <Option value="desc">Sort By: Latest</Option>
                <Option value="asc">Sort By: Old</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="category" label="Categories">
              <Selector mode="multiple" action="Categories" />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="language" label="Language">
              <Select defaultValue="all">
                <Option value="all">All</Option>
                <Option value="english">English</Option>
                <Option value="telugu">Telugu</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col>
            <Link key="1" to="/podcasts/create">
              <Button
                disabled={!(actions.includes('admin') || actions.includes('create'))}
                type="primary"
              >
                New Podcast
              </Button>
            </Link>
          </Col>
        </Row>
      </Form>
      <PodcastList
        actions={actions}
        data={{ podcasts: podcasts, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
        fetchPodcasts={fetchPodcasts}
      />
    </Space>
  );
}

export default Podcasts;
