/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Space, Button, Select, Form, Col, Row, Input } from 'antd';
import { Link, useLocation, useHistory } from 'react-router-dom';
import PageList from './components/PageList';
import { useSelector, useDispatch } from 'react-redux';
import getUserPermission from '../../utils/getUserPermission';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import deepEqual from 'deep-equal';
import { getPages } from '../../actions/pages';
import Selector from '../../components/Selector';

function Pages({ formats }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'pages', action: 'get', spaces });
  const { Option } = Select;
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const query = new URLSearchParams(useLocation().search);
  const history = useHistory();

  const params = {};
  const keys = ['page', 'limit', 'q', 'sort', 'tag', 'category', 'author', 'status'];
  keys.forEach((key) => {
    if (query.get(key)) {
      if (key === 'tag' || key === 'category' || key === 'author') {
        const val = query.getAll(key).map((v) => parseInt(v));
        params[key] = val;
      } else if (key === 'sort' || key === 'status' || key === 'q') {
        params[key] = query.get(key);
      } else {
        params[key] = parseInt(query.get(key));
      }
    }
  });
  const [filters, setFilters] = React.useState({
    ...params,
  });
  const pathName = useLocation().pathname;
  let searchFilter = new URLSearchParams(useLocation().search);

  React.useEffect(() => {
    keys.forEach((key) => {
      searchFilter.has(key) ? searchFilter.delete(key) : null;
    });
    Object.keys(filters).forEach(function (key) {
      if (key === 'tag' || key === 'category' || key === 'author') {
        searchFilter.delete(key);
        filters[key].map((each) => {
          searchFilter.append(key, each);
        });
      } else {
        searchFilter.set(key, filters[key]);
      }
    });
    history.push({
      pathName: pathName,
      search: '?' + searchFilter.toString(),
    });
  }, [history, filters]);

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

  React.useEffect(() => {
    fetchPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchPages = () => {
    dispatch(getPages(filters));
  };

  const onSave = (values) => {
    let filterValue = {};
    if (values.status === 'all') {
      values.status = null;
    }
    Object.keys(values).forEach(function (key) {
      if (values[key]) {
        if (key === 'tag' || key === 'author' || key === 'category') {
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
  if (!formats.loading && formats.article)
    return (
      <Space direction="vertical">
        <Form
          initialValues={filters}
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
          <Row gutter={24}>
            <Col key={1}>
              <Link to="/pages/create">
                <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
                  Create New
                </Button>
              </Link>
            </Col>
            <Col key={2} span={9} offset={12}>
              <Space direction="horizontal">
                <Form.Item name="q">
                  <Input placeholder="Search pages" />
                </Form.Item>

                <Form.Item>
                  <Button htmlType="submit">Search</Button>
                </Form.Item>
                <Form.Item name="sort" label="Sort">
                  <Select defaultValue="desc" style={{ width: '100%' }}>
                    <Option value="desc">Latest</Option>
                    <Option value="asc">Old</Option>
                  </Select>
                </Form.Item>
              </Space>
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={4} key={4}>
              <Form.Item name="status" label="Status">
                <Select defaultValue="all">
                  <Option value="all">All</Option>
                  <Option value="draft">Draft</Option>
                  <Option value="publish">Publish</Option>
                  <Option value="ready">Ready to Publish</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6} key={5}>
              <Form.Item name="tag" label="Tags">
                <Selector mode="multiple" action="Tags" placeholder="Filter Tags" />
              </Form.Item>
            </Col>
            <Col span={6} key={6}>
              <Form.Item name="category" label="Categories">
                <Selector mode="multiple" action="Categories" placeholder="Filter Categories" />
              </Form.Item>
            </Col>
            <Col span={6} key={7}>
              <Form.Item name="author" label="Authors">
                <Selector
                  mode="multiple"
                  action="Authors"
                  placeholder="Filter Authors"
                  display={'email'}
                />
              </Form.Item>
            </Col>
          </Row>
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
          filters={filters}
          setFilters={setFilters}
          fetchPages={fetchPages}
        />
      </Space>
    );
  return <FormatNotFound status="info" title="Article format not found" link="/formats/create" />;
}

export default Pages;
