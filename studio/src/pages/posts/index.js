/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Space, Button, Form, Col, Row, Input, Select } from 'antd';
import { Link, useHistory, useLocation } from 'react-router-dom';
import PostList from '../../components/List';
import getUserPermission from '../../utils/getUserPermission';
import { useSelector, useDispatch } from 'react-redux';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import deepEqual from 'deep-equal';
import { getPosts } from '../../actions/posts';
import Selector from '../../components/Selector';
import Template from '../../components/Template';
import getUrlParams from '../../utils/getUrlParams';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet';

function Posts({ formats }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'posts', action: 'get', spaces });
  const query = new URLSearchParams(useLocation().search);
  const { Option } = Select;
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [formatFlag, setFormatFlag] = React.useState(false);
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
  const history = useHistory();

  const keys = ['format', 'page', 'limit', 'q', 'sort', 'tag', 'category', 'author', , 'status'];
  const params = getUrlParams(query, keys);
  if (formats && !formats.loading && formats.article) {
    params['format'] = [formats.article.id];
  }
  const [filters, setFilters] = React.useState({
    ...params,
  });

  React.useEffect(() => {
    if (filters !== params) {
      setFilters({ ...params });
    }
  }, [window.location.href]);

  React.useEffect(() => {
    form.resetFields();
    form.setFieldsValue(filters);
  }, [form, filters]);

  const pathName = useLocation().pathname;
  let searchFilter = new URLSearchParams(useLocation().search);

  React.useEffect(() => {
    keys.forEach((key) => {
      if (searchFilter.has(key)) {
        searchFilter.delete(key);
      }
    });
    Object.keys(filters).forEach(function (key) {
      if (key === 'format' || key === 'tag' || key === 'category' || key === 'author') {
        searchFilter.delete(key);
        filters[key].map((each) => {
          return searchFilter.append(key, each);
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

  if (!formatFlag && !formats.loading && formats.article) {
    setFilters({ ...filters, format: [formats.article.id] });
    setFormatFlag(true);
  }
  const { posts, total, loading, tags, categories, authors } = useSelector((state) => {
    const node = state.posts.req.find((item) => {
      return deepEqual(item.query, params);
    });

    if (node)
      return {
        posts: node.data.map((element) => {
          const post = state.posts.details[element];

          post.medium = state.media.details[post.featured_medium_id];
          return post;
        }),
        total: node.total,
        loading: state.posts.loading,
        tags: state.tags.details,
        categories: state.categories.details,
        authors: state.authors.details,
      };
    return {
      posts: [],
      total: 0,
      loading: state.posts.loading,
      tags: {},
      categories: {},
      authors: {},
    };
  });

  React.useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchPosts = () => {
    dispatch(getPosts(filters));
  };
  const onSave = (values) => {
    let filterValue = {};
    if (values.status === 'all') {
      values.status = null;
    }
    Object.keys(values).forEach(function (key) {
      if (values[key]) {
        if (key === 'format' || key === 'tag' || key === 'author' || key === 'category') {
          if (values[key].length > 0) {
            filterValue[key] = values[key];
          }
        } else {
          filterValue[key] = values[key];
        }
      }
    });
    filterValue['format'] = filters.format;
    setFilters(filterValue);
  };
  if (!formats.loading && formats.article)
    return (
      <Space direction="vertical">
        <Helmet title={'Posts'} />
        <Template format={formats.article} />

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
          <Row justify="end" gutter={16} style={{ marginBottom: '1rem' }}>
            <Col key={2} style={{ display: 'flex', justifyContent: 'end' }}>
              <Form.Item name="q">
                <Input placeholder="Search posts" />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit">Search</Button>
              </Form.Item>
            </Col>
            <Col key={4}>
              <Form.Item name="status">
                <Select defaultValue="all">
                  <Option value="all">Status: All</Option>
                  <Option value="draft">Status: Draft</Option>
                  <Option value="publish">Status: Publish</Option>
                  <Option value="ready">Status: Ready to Publish</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="sort">
                <Select defaultValue="desc" style={{ width: '100%' }}>
                  <Option value="desc">Sort By: Latest</Option>
                  <Option value="asc">Sort By: Old</Option>
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
              <Link to="/posts/create">
                <Button
                  disabled={!(actions.includes('admin') || actions.includes('create'))}
                  type="primary"
                >
                  New Post
                </Button>
              </Link>
            </Col>
          </Row>
          <Row gutter={16}>{getFields()}</Row>
        </Form>
        <PostList
          actions={actions}
          format={formats.article}
          data={{
            posts: posts,
            total: total,
            loading: loading,
            tags: tags,
            categories: categories,
            authors: authors,
          }}
          filters={filters}
          setFilters={setFilters}
          fetchPosts={fetchPosts}
        />
      </Space>
    );
  return <FormatNotFound status="info" title="Article format not found" link="/formats/create" />;
}

export default Posts;
