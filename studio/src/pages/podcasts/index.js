/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import PodcastList from './components/PodcastList';
import {
  Space,
  Button,
  Form,
  Row,
  Col,
  Input,
  Select,
  Typography,
  Tooltip,
  ConfigProvider,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import getUserPermission from '../../utils/getUserPermission';
import { getPodcasts } from '../../actions/podcasts';
import deepEqual from 'deep-equal';
import getUrlParams from '../../utils/getUrlParams';
import Selector from '../../components/Selector';
import Loader from '../../components/Loader';
import { Helmet } from 'react-helmet';
import Filters from '../../utils/filters';

function Podcasts({ permission }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'podcasts', action: 'get', spaces });
  const dispatch = useDispatch();
  const history = useNavigate();
  const query = new URLSearchParams(useLocation().search);

  const keys = ['page', 'limit', 'q', 'sort', 'category', 'language'];
  const params = getUrlParams(query, keys);
  const [filters, setFilters] = React.useState({
    ...params,
  });
  const [searchFieldExpand, setSearchFieldExpand] = React.useState(false);
  const [isMobileScreen, setIsMobileScreen] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobileScreen(true);
      } else {
        setIsMobileScreen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    history({
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
    console.log('node', state.podcasts);

    if (node)
      return {
        podcasts: node.data.map((element) => state.podcasts.details[element]),
        total: node.total,
        loading: state.podcasts.loading,
      };
    return { podcasts: [], total: 0, loading: state.podcasts.loading };
  });
  useEffect(() => {
    if (form) form.setFieldsValue(new Filters(params));
  }, [params]);
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

  return loading ? (
    <Loader />
  ) : (
    <Space direction="vertical">
      <Helmet title={'Podcasts'} />
      <ConfigProvider
        theme={{
          components: {
            Form: {
              marginLG: 0,
            },
          },
        }}
      >
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
          <Row justify="space-between" gutter={16}>
            <Col>
              <Row gutter={16}>
                <Col>
                  <Typography.Title
                    level={3}
                    style={{ margin: 0, display: 'inline', color: '#1E1E1E' }}
                  >
                    Podcasts
                  </Typography.Title>
                </Col>
                <Col>
                  {searchFieldExpand ? (
                    <Row gutter={8}>
                      <Col>
                        <Form.Item name="q">
                          <Input placeholder="Search podcasts" />
                          {/**/}
                        </Form.Item>
                      </Col>
                      <Col>
                        <Form.Item>
                          <Button htmlType="submit" icon={<SearchOutlined />}>
                            Search
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  ) : (
                    <Tooltip title="search">
                      <Button
                        shape="circle"
                        // style={{ border: 'none' }}
                        type="text"
                        onClick={() => {
                          setSearchFieldExpand(true);
                        }}
                        icon={<SearchOutlined />}
                      />
                    </Tooltip>
                  )}
                </Col>
              </Row>
            </Col>
            <Col span={isMobileScreen ? 24 : 16}>
              <Row justify="end" gutter={16}>
                <Col span={24}>
                  <Row justify="end">
                    <Link to="/podcasts/create">
                      <Button
                        disabled={!(actions.includes('admin') || actions.includes('create'))}
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ margin: isMobileScreen ? '16px 0' : '0 0 16px 0' }}
                      >
                        Create
                      </Button>
                    </Link>
                  </Row>
                  <Row gutter={16} justify={isMobileScreen ? 'space-between' : 'end'}>
                    <Col span={isMobileScreen ? 24 : 8}>
                      <Form.Item name="category" label="Categories">
                        <Selector mode="multiple" action="Categories" />
                      </Form.Item>
                    </Col>
                    <Col span={isMobileScreen ? 24 : 6}>
                      <Form.Item name="language" label="Language">
                        <Select defaultValue="all">
                          <Option value="all">All</Option>
                          <Option value="english">English</Option>
                          <Option value="telugu">Telugu</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item label="Sort By" name="sort">
                        <Select placeholder="Sort By" defaultValue="desc" style={{ width: '100%' }}>
                          <Option value="desc" key={'desc'}>
                            Latest
                          </Option>
                          <Option value="asc" key={'asc'}>
                            Old
                          </Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </ConfigProvider>
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
