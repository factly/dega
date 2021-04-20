import React, { useState } from 'react';
import { Popconfirm, Button, List, Input, Select, Form, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getPosts, deletePost } from '../../actions/posts';
import { Link } from 'react-router-dom';
import Selector from '../../components/Selector';
import deepEqual from 'deep-equal';
import Template from '../../components/Template';
import ImagePlaceholder from '../../components/ErrorsAndImage/PlaceholderImage';
import QuickEdit from './QuickEdit';
import moment from 'moment';

function PostList({ actions, format }) {
  const dispatch = useDispatch();
  const { Option } = Select;
  const [form] = Form.useForm();

  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
    format: [format.id],
  });
  const [id, setID] = useState(0);

  const { posts, total, loading, tags, categories } = useSelector((state) => {
    const node = state.posts.req.find((item) => {
      return deepEqual(item.query, filters);
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
      };
    return { posts: [], total: 0, loading: state.posts.loading, tags: {}, categories: {} };
  });

  React.useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchPosts = () => {
    dispatch(getPosts(filters));
  };

  const onSave = (values) => {
    let filterValue = {
      tag: values.tags,
      category: values.categories,
      sort: values.sort,
      q: values.q,
    };

    setFilters({ ...filters, ...filterValue });
  };

  const getTagList = (tagids) => {
    return tagids.map((id) => <Tag>{tags[id].name}</Tag>);
  };
  const getCategoryList = (catIds) => {
    return catIds.map((id) => <Tag>{categories[id].name}</Tag>);
  };

  return (
    <Space direction="vertical">
      <Template format={format} />
      <Form
        initialValues={filters}
        form={form}
        name="filters"
        layout="inline"
        onFinish={(values) => onSave(values)}
        style={{ maxWidth: '100%' }}
      >
        <Form.Item name="q" label="Search" style={{ width: '25%' }}>
          <Input placeholder="search posts" />
        </Form.Item>
        <Form.Item name="sort" label="Sort" style={{ width: '15%' }}>
          <Select defaultValue="desc" style={{ maxWidth: '160px' }}>
            <Option value="desc">Latest</Option>
            <Option value="asc">Old</Option>
          </Select>
        </Form.Item>
        <Form.Item name="tags" label="Tags" style={{ width: '15%' }}>
          <Selector
            mode="multiple"
            action="Tags"
            placeholder="Filter Tags"
            style={{ maxWidth: '160px' }}
          />
        </Form.Item>
        <Form.Item name="categories" label="Categories" style={{ width: '15%' }}>
          <Selector
            mode="multiple"
            action="Categories"
            placeholder="Filter Categories"
            style={{ maxWidth: '160px' }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      <List
        bordered
        className="post-list"
        loading={loading}
        itemLayout="vertical"
        dataSource={posts}
        pagination={{
          total: total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) =>
            setFilters({ ...filters, page: pageNumber, limit: pageSize }),
        }}
        renderItem={(item) => (
          <List.Item
            actions={
              item.id !== id
                ? [
                    <Link
                      style={{
                        marginRight: 8,
                      }}
                      to={
                        format.slug === 'article'
                          ? `/posts/${item.id}/edit`
                          : `/fact-checks/${item.id}/edit`
                      }
                    >
                      <Button
                        icon={<EditOutlined />}
                        disabled={!(actions.includes('admin') || actions.includes('update'))}
                      >
                        Edit
                      </Button>
                    </Link>,
                    <Popconfirm
                      title="Sure to Delete?"
                      onConfirm={() => dispatch(deletePost(item.id)).then(() => fetchPosts())}
                      disabled={!(actions.includes('admin') || actions.includes('delete'))}
                    >
                      <Button
                        icon={<DeleteOutlined />}
                        disabled={!(actions.includes('admin') || actions.includes('delete'))}
                      >
                        Delete
                      </Button>
                    </Popconfirm>,
                    <Button
                      icon={<EditOutlined />}
                      disabled={!(actions.includes('admin') || actions.includes('update'))}
                      onClick={() => setID(item.id)}
                    >
                      Quick Edit
                    </Button>,
                    item.status === 'publish' ? (
                      <Tag style={{ width: '100px', padding: '5px' }} color="success">
                        Published
                      </Tag>
                    ) : (
                      <Tag style={{ width: '100px', padding: '5px' }} color="error">
                        Draft
                      </Tag>
                    ),
                  ]
                : []
            }
            extra={
              item.id !== id ? (
                item.medium ? (
                  <img
                    style={{ width: '100%', height: '100%' }}
                    alt={item.medium.alt_text}
                    src={
                      item.medium.url?.proxy
                        ? `${item.medium.url.proxy}?resize:fill:150:150/gravity:sm`
                        : ''
                    }
                  />
                ) : (
                  <ImagePlaceholder height={150} width={150} />
                )
              ) : null
            }
          >
            {item.id !== id ? (
              <List.Item.Meta
                title={
                  <Link
                    to={
                      format.slug === 'article'
                        ? `/posts/${item.id}/edit`
                        : `/fact-checks/${item.id}/edit`
                    }
                  >
                    {item.title}
                  </Link>
                }
                description={item.excerpt}
              />
            ) : null}
            {item.id === id ? <QuickEdit data={item} setID={setID} slug={format.slug} /> : null}
            {item.id !== id ? (
              <Space direction="vertical">
                {item.published_date ? (
                  <div>Published Date: {moment(item.published_date).format('MMMM Do YYYY')}</div>
                ) : null}
                {item.tags && item.tags.length > 0 ? (
                  <div>Tags: {getTagList(item.tags)}</div>
                ) : null}

                {item.categories && item.categories.length > 0 ? (
                  <div>Categories: {getCategoryList(item.categories)}</div>
                ) : null}
              </Space>
            ) : null}
          </List.Item>
        )}
      />
    </Space>
  );
}

export default PostList;
