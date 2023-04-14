/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import {
  Space,
  Button,
  Select,
  Form,
  Col,
  Row,
  Input,
  Tabs,
  Typography,
  Tooltip,
  ConfigProvider,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useHistory } from 'react-router-dom';
import PageList from './components/PageList';
import { useSelector, useDispatch } from 'react-redux';
import getUserPermission from '../../utils/getUserPermission';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import deepEqual from 'deep-equal';
import { getPages } from '../../actions/pages';
import Selector from '../../components/Selector';
import getUrlParams from '../../utils/getUrlParams';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import Loader from '../../components/Loader';
import { Helmet } from 'react-helmet';
import Filters from '../../utils/filters';

function Pages({ formats }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'pages', action: 'get', spaces });
  const { Option } = Select;
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { search, pathname } = useLocation();
  const query = new URLSearchParams(search);
  const history = useHistory();
  const [expand, setExpand] = React.useState(false);
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

  const getFields = () => {
    const children = [];
    expand &&
      children.push(
        <Col span={isMobileScreen ? 24 : 8} key={5} style={{ marginBottom: 16 }}>
          <Form.Item name="tag" label="Tags">
            <Selector mode="multiple" action="Tags" placeholder="Filter Tags" />
          </Form.Item>
        </Col>,
        <Col span={isMobileScreen ? 24 : 8} key={6} style={{ marginBottom: 16 }}>
          <Form.Item name="category" label="Categories">
            <Selector mode="multiple" action="Categories" placeholder="Filter Categories" />
          </Form.Item>
        </Col>,
        <Col span={isMobileScreen ? 24 : 8} key={7} style={{ marginBottom: 16 }}>
          <Form.Item name="author" label="Authors">
            <Selector
              mode="multiple"
              action="Authors"
              placeholder="Filter Authors"
              display="display_name"
            />
          </Form.Item>
        </Col>,
      );
    return children;
  };

  const keys = ['page', 'limit', 'q', 'sort', 'tag', 'category', 'author', 'status'];
  const params = getUrlParams(query, keys);

  useEffect(() => {
    if (form) {
      form.setFieldsValue(new Filters(params));
    }
  }, [search, formats.loading]);

  useEffect(() => {
    fetchPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchPages = () => {
    dispatch(getPages(params));
  };

  const { pages, total, loading, tags, categories } = useSelector((state) => {
    const node = state.pages.req.find((item) => {
      return deepEqual(item.query, params);
    });

    if (node)
      return {
        pages: node.data.map((element) => {
          const page = state.pages.details[element];

          page.medium = state.media.details[page.featured_medium_id];
          return page;
        }),
        total: node.total,
        loading: state.pages.loading,
        tags: state.tags.details,
        categories: state.categories.details,
      };
    return { pages: [], total: 0, loading: state.pages.loading, tags: {}, categories: {} };
  });

  const pageStatusItems = [
    {
      key: 'all',
      label: 'All',
    },
    {
      key: 'publish',
      label: 'Published',
    },
    {
      key: 'ready',
      label: 'Ready to Pubish',
    },
    {
      key: 'draft',
      label: 'Drafts',
    },
  ];

  const onSave = (values) => {
    let searchFilter = new URLSearchParams();
    Object.keys(values).forEach(function (key) {
      if (values[key]) {
        if (key === 'format' || key === 'tag' || key === 'author' || key === 'category') {
          values[key].map((each) => {
            return searchFilter.append(key, each);
          });
        } else {
          if (values.status !== 'all') searchFilter.set(key, values[key]);
        }
      }
    });
    if (formats && !formats.loading && formats.article) {
      searchFilter.set('format', formats.article.id);
    }
    history.push({
      pathName: pathname,
      search: '?' + searchFilter.toString(),
    });
  };

  const onPagination = (page, limit) => {
    query.set('limit', limit);
    query.set('page', page);
    history.push({
      pathName: pathname,
      search: '?' + query.toString(),
    });
  };
  return formats.loading ? (
    <Loader />
  ) : formats.article ? (
    <Space direction="vertical">
      <Helmet title={'Pages'} />
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
          initialValues={params}
          form={form}
          name="filters"
          onFinish={(values) => onSave(values)}
          style={{ width: '100%' }}
          className="ant-advanced-search-form"
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
                    Pages
                  </Typography.Title>
                </Col>
                <Col>
                  {searchFieldExpand ? (
                    <Row>
                      <Form.Item name="q">
                        <Input placeholder="Search pages" />
                        {/**/}
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
            <Col span={isMobileScreen ? 24 : 8}>
              <Row justify="end" gutter={16}>
                <Col span={24}>
                  <Row justify="end">
                    <Link to="/pages/create">
                      {/**/}
                      <Button
                        disabled={!(actions.includes('admin') || actions.includes('create'))}
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ marginBottom: 16 }}
                      >
                        Create
                      </Button>
                    </Link>
                  </Row>
                  <Row gutter={16} justify={isMobileScreen ? 'space-between' : 'end'}>
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
                    <Col>
                      <Button
                        type="secondary"
                        style={{ background: '#F1F1F1' }}
                        onClick={() => {
                          setExpand(!expand);
                        }}
                      >
                        {expand ? (
                          <>
                            Hide Filters <UpOutlined />
                          </>
                        ) : (
                          <>
                            More Filters <DownOutlined />
                          </>
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Row justify="space-between" style={{ marginTop: 16 }} gutter={42}>
                {getFields()}
              </Row>
            </Col>
          </Row>
        </Form>
      </ConfigProvider>
      <Tabs
        defaultActiveKey={query.get('status') || 'all'}
        items={pageStatusItems}
        onChange={(key) => {
          const formValues = form.getFieldsValue();
          onSave({
            ...formValues,
            status: key,
          });
        }}
      />
      <PageList
        actions={actions}
        format={formats.article}
        data={{
          pages: pages,
          total: total,
          loading: loading,
          tags: tags,
          categories: categories,
        }}
        filters={params}
        onPagination={onPagination}
        fetchPages={fetchPages}
      />
    </Space>
  ) : (
    <FormatNotFound
      status="info"
      title="Article format not found"
      link="/advanced/formats/create"
    />
  );
}

export default Pages;
