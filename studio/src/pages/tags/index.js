/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import TagList from './components/TagList';
import {
  Space,
  Button,
  Form,
  Input,
  Select,
  Row,
  Col,
  ConfigProvider,
  Typography,
  Tooltip,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getTags } from '../../actions/tags';
import { Link, useHistory, useLocation } from 'react-router-dom';
import deepEqual from 'deep-equal';
import getUrlParams from '../../utils/getUrlParams';
import Loader from '../../components/Loader';
import { Helmet } from 'react-helmet';
import Filters from '../../utils/filters';

function Tags({ permission }) {
  const { actions } = permission;
  const history = useHistory();
  const dispatch = useDispatch();
  const query = new URLSearchParams(useLocation().search);
  const [searchFieldExpand, setSearchFieldExpand] = React.useState(false);

  const params = getUrlParams(query);
  const [filters, setFilters] = React.useState({
    ...params,
  });
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

  useEffect(() => {
    history.push({
      pathname: pathName,
      search: new URLSearchParams(filters).toString(),
    });
  }, [history, filters]);

  const [form] = Form.useForm();
  const { Option } = Select;

  const { tags, total, loading } = useSelector((state) => {
    const node = state.tags.req.find((item) => {
      return deepEqual(item.query, params);
    });

    if (node)
      return {
        tags: node.data.map((element) => state.tags.details[element]),
        total: node.total,
        loading: state.tags.loading,
      };
    return { tags: [], total: 0, loading: state.tags.loading };
  });
  useEffect(() => {
    if (form) form.setFieldsValue(new Filters(params));
  }, [params]);
  React.useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchTags = () => {
    dispatch(getTags(filters));
  };
  return loading ? (
    <Loader />
  ) : (
    <Space direction="vertical">
      <Helmet title={'Tags'} />
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
          onFinish={(values) => {
            let filterValue = {};
            Object.keys(values).forEach(function (key) {
              if (values[key]) {
                filterValue[key] = values[key];
              }
            });
            setFilters({
              ...filters,
              ...filterValue,
            });
          }}
          style={{ width: '100%' }}
          onValuesChange={(changedValues, allValues) => {
            if (!changedValues.q) {
              if (changedValues.q === '') {
                const { q, ...filtersWithoutQuery } = filters;
                setFilters({ ...filtersWithoutQuery });
                return;
              }
              setFilters({ ...filters, ...changedValues });
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
                    Tags
                  </Typography.Title>
                </Col>
                <Col>
                  {searchFieldExpand ? (
                    <Row>
                      <Form.Item name="q">
                        <Input placeholder="Search tags" />
                      </Form.Item>
                      <Form.Item>
                        <Button htmlType="submit" icon={<SearchOutlined />}>
                          Search
                        </Button>
                      </Form.Item>
                    </Row>
                  ) : (
                    <Tooltip title="search">
                      <Button
                        shape="circle"
                        type="text"
                        onFocus={() => {
                          setSearchFieldExpand(true);
                          setTimeout(() => {
                            form.getFieldsValue().q === undefined && setSearchFieldExpand(false);
                          }, 10000);
                        }}
                        icon={<SearchOutlined />}
                      />
                    </Tooltip>
                  )}
                </Col>
              </Row>
            </Col>
            <Col xs={24} md={8}>
              <Row
                gutter={16}
                style={{
                  justifyContent: isMobileScreen ? 'space-between' : 'end',
                  flexDirection: isMobileScreen && 'row-reverse',
                  marginTop: isMobileScreen && '1rem',
                }}
              >
                <Col md={24} xs={12}>
                  <Row justify="end">
                    <Link to="/tags/create">
                      <Button
                        disabled={!(actions.includes('admin') || actions.includes('create'))}
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ marginBottom: '1.5rem' }}
                      >
                        Create
                      </Button>
                    </Link>
                  </Row>
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
        </Form>
      </ConfigProvider>
      <TagList
        actions={actions}
        data={{ tags: tags, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
        fetchTags={fetchTags}
      />
    </Space>
  );
}

export default Tags;
