import React from 'react';
import { Popconfirm, Button, List } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getPosts, deletePost } from '../../../actions/posts';
import { Link } from 'react-router-dom';
import deepEqual from 'deep-equal';

function PostsList() {
  const dispatch = useDispatch();

  const [page, setPage] = React.useState(1);

  const { posts, total, loading } = useSelector((state) => {
    const node = state.posts.req.find((item) => {
      return deepEqual(item.query, { page });
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
  }, [page]);

  const fetchPosts = () => {
    dispatch(getPosts({ page: page }));
  };

  return (
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
        onChange: (page, pageSize) => setPage(page),
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
          extra={item.medium ? <img width={272} alt={item.alt_text} src={item.medium.url} /> : null}
        >
          <List.Item.Meta
            title={<Link to={`/posts/${item.id}/edit`}>{item.title}</Link>}
            description={item.excerpt}
          />
        </List.Item>
      )}
    />
  );
}

export default PostsList;
