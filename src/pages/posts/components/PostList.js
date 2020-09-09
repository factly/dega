import React from 'react';
import { Popconfirm, Button, List, Input, Select, Form, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getPosts, deletePost } from '../../../actions/posts';
import { Link } from 'react-router-dom';
import Selector from '../../../components/Selector';
import deepEqual from 'deep-equal';

function PostList() {
  const dispatch = useDispatch();

  const { Option } = Select;
  const [form] = Form.useForm();

  const [page, setPage] = React.useState(1);

  const [filters, setFilters] = React.useState();

  const { posts, total, loading } = useSelector((state) => {
    const node = state.posts.req.find((item) => {
      let query = {
        page,
      };
      if (filters) {
        query = { ...query, ...filters };
      }
      return deepEqual(item.query, query);
    });

    if (node)
      return {
        posts: node.data.map((element) => state.posts.details[element]),
        total: node.total,
        loading: state.posts.loading,
      };
    return { posts: [], total: 0, loading: state.posts.loading };
  });

  React.useEffect(() => {
    fetchPosts();
  }, [page, filters]);

  const fetchPosts = () => {
    dispatch(getPosts({ page: page, ...filters }));
  };

  const onSave = (values) => {
    let filterValue = {
      tag: values.tags,
      category: values.categories,
      format: values.formats,
      sort_by: values.sort_by,
    };

    setFilters(filterValue);
  };

  return (
    <Space direction="vertical">
      <Form
        initialValues={filters}
        form={form}
        name="filters"
        layout="inline"
        onFinish={(values) => onSave(values)}
        style={{ maxWidth: '100%' }}
      >
        <Form.Item name="post" label="Query" style={{ width: '25%' }}>
          <Input placeholder="search post" />
        </Form.Item>
        <Form.Item name="sort" label="sort" style={{ width: '15%' }}>
          <Select>
            <Option value="desc">Latest</Option>
            <Option value="asc">Old</Option>
          </Select>
        </Form.Item>
        <Form.Item name="tags" label="tags" style={{ width: '15%' }}>
          <Selector mode="multiple" action="Tags" />
        </Form.Item>
        <Form.Item name="categories" label="categories" style={{ width: '15%' }}>
          <Selector mode="multiple" action="Categories" />
        </Form.Item>
        <Form.Item name="formats" label="formats" style={{ width: '15%' }}>
          <Selector mode="multiple" action="Formats" />
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
          current: page,
          pageSize: 5,
          onChange: (pageNumber, pageSize) => setPage(pageNumber),
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
                <Button icon={<EditOutlined />}>Edit</Button>
              </Link>,
              <Popconfirm
                title="Sure to cancel?"
                onConfirm={() => dispatch(deletePost(item.id)).then(() => fetchPosts())}
              >
                <Button icon={<DeleteOutlined />}>Delete</Button>
              </Popconfirm>,
            ]}
            extra={
              item.medium ? (
                <img width={272} alt={item.medium.alt_text} src={item.medium.url} />
              ) : null
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
