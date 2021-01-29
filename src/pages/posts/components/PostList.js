import React from 'react';
import { Popconfirm, Button, List, Input, Select, Form, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getPosts, deletePost } from '../../../actions/posts';
import { Link } from 'react-router-dom';
import Selector from '../../../components/Selector';
import deepEqual from 'deep-equal';
import Template from '../../../components/Template';
import ImagePlaceholder from '../../../components/ErrorsAndImage/PlaceholderImage';

function PostList({ actions, format }) {
  const dispatch = useDispatch();

  const { Option } = Select;
  const [form] = Form.useForm();

  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 5,
    format: [format],
  });

  const { posts, total, loading } = useSelector((state) => {
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
      };
    return { posts: [], total: 0, loading: state.posts.loading };
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
      format: values.formats,
      sort: values.sort,
      q: values.q,
    };

    setFilters({ ...filters, ...filterValue });
  };

  return (
    <Space direction="vertical">
      <Template formatId={format} />
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
        <Form.Item name="formats" label="Formats" style={{ width: '15%' }}>
          <Selector
            mode="multiple"
            action="Formats"
            placeholder="Filter Formats"
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
            setFilters({ ...filters, page: pageNumber, limit: pageSize, format: filters.format }),
        }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Link
                style={{
                  marginRight: 8,
                }}
                to={`/posts/${item.id}/edit`}
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
            ]}
            extra={
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
            }
          >
            <List.Item.Meta
              title={<Link to={`/posts/${item.id}/edit`}>{item.title}</Link>}
              description={item.excerpt}
            />
          </List.Item>
        )}
      />
    </Space>
  );
}

export default PostList;
