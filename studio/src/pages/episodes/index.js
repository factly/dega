/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import EpisodeList from './components/EpisodeList';
import { Space, Button, Form, Col, Row, Select, Input } from 'antd';
import { Link, useLocation, useHistory } from 'react-router-dom';
import getUserPermission from '../../utils/getUserPermission';
import { useDispatch, useSelector } from 'react-redux';
import deepEqual from 'deep-equal';
import { getEpisodes } from '../../actions/episodes';
import getUrlParams from '../../utils/getUrlParams';
import Selector from '../../components/Selector';
import Loader from '../../components/Loader';
import { Helmet } from 'react-helmet';
import Filters from '../../utils/filters';

function Episodes({ permission }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'episodes', action: 'get', spaces });
  const dispatch = useDispatch();
  const history = useHistory();
  const query = new URLSearchParams(useLocation().search);

  const keys = ['page', 'limit', 'q', 'sort', 'podcast'];
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
      if (key === 'podcast') {
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

  const { episodes, total, loading } = useSelector((state) => {
    const node = state.episodes.req.find((item) => {
      return deepEqual(item.query, params);
    });

    if (node)
      return {
        episodes: node.data.map((element) => state.episodes.details[element]),
        total: node.total,
        loading: state.episodes.loading,
      };
    return { episodes: [], total: 0, loading: state.episodes.loading };
  });
  useEffect(() => {
    if (form) form.setFieldsValue(new Filters(params));
  }, [params]);
  React.useEffect(() => {
    fetchEpisodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchEpisodes = () => {
    dispatch(getEpisodes(filters));
  };
  const onSave = (values) => {
    let filterValue = {};
    Object.keys(values).forEach(function (key) {
      if (values[key]) {
        if (key === 'podcast') {
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
  return loading ? (
    <Loader />
  ) : (
    <Space direction="vertical">
      <Helmet title={'Episodes'} />
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
              <Input placeholder="Search episodes" />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Search</Button>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="podcast" label="Podcasts">
              <Selector mode="multiple" action="Podcasts" display="title" />
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
          <Col key={1}>
            <Link key="1" to="/episodes/create">
              <Button
                disabled={!(actions.includes('admin') || actions.includes('create'))}
                type="primary"
              >
                New Episode
              </Button>
            </Link>
          </Col>
        </Row>
      </Form>
      <EpisodeList
        actions={actions}
        data={{ episodes: episodes, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
        fetchEpisodes={fetchEpisodes}
      />
    </Space>
  );
}

export default Episodes;
