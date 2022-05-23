/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Space, Button, Select, Form, Col, Row, Input } from 'antd';
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
  const getFields = () => {
    const children = [];
    expand &&
      children.push(
        <Col span={8} key={5}>
          <Form.Item name="tag" label="Tags">
            <Selector mode="multiple" action="Tags" placeholder="Filter Tags" />
          </Form.Item>
        </Col>,
        <Col span={8} key={6}>
          <Form.Item name="category" label="Categories">
            <Selector mode="multiple" action="Categories" placeholder="Filter Categories" />
          </Form.Item>
        </Col>,
        <Col span={8} key={7}>
          <Form.Item name="author" label="Authors">
            <Selector
              mode="multiple"
              action="Authors"
              placeholder="Filter Authors"
              display={'email'}
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
      <Form
        initialValues={params}
        form={form}
        name="filters"
        onFinish={(values) => onSave(values)}
        style={{ maxWidth: '100%' }}
        className="ant-advanced-search-form"
        onValuesChange={(changedValues, allValues) => {
          if (!changedValues.q) {
            onSave(allValues);
          }
        }}
      >
        <Row justify="end" gutter={16} style={{ marginBottom: '1rem' }}>
          <Col key={2} style={{ display: 'flex', justifyContent: 'end' }}>
            <Form.Item name="q">
              <Input placeholder="Search pages" />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Search</Button>
            </Form.Item>
          </Col>
          <Col key={4}>
            <Form.Item label="Status" name="status">
              <Select placeholder="Status" defaultValue="all">
                <Option value="all" key={'all'}>
                  All
                </Option>
                <Option value="draft" key={'draft'}>
                  Draft
                </Option>
                <Option value="publish" key={'publish'}>
                  Publish
                </Option>
                <Option value="ready" key={'ready'}>
                  Ready to Publish
                </Option>
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
          <Button
            type="link"
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
          <Col key={1}>
            <Link to="/pages/create">
              <Button
                disabled={!(actions.includes('admin') || actions.includes('create'))}
                type="primary"
              >
                New Page
              </Button>
            </Link>
          </Col>
        </Row>
        <Row gutter={16}>{getFields()}</Row>
      </Form>
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
    <FormatNotFound status="info" title="Article format not found" link="/formats/create" />
  );
}

export default Pages;
