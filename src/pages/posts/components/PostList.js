import React from 'react';
import { Popconfirm, Button, List } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getPosts, deletePost } from '../../../actions/posts';
import { Link } from 'react-router-dom';
import { entitySelector } from '../../../selectors';

function PostList() {
  const dispatch = useDispatch();

  const [page, setPage] = React.useState(1);

  const { posts, total, loading } = useSelector((state) => entitySelector(state, page, 'posts'));

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
  );
}

export default PostList;
