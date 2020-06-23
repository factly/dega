import React from 'react';
import { Popconfirm, Button, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getPosts, deletePost } from '../../../actions/posts';
import { Link } from 'react-router-dom';

function PostsList() {
  const dispatch = useDispatch();

  const [page, setPage] = React.useState(1);

  const { posts, total, loading } = useSelector((state) => {
    const node = state.posts.req.find((item) => {
      return item.query.page === page;
    });

    if (node)
      return {
        posts: node.data.map((element) => state.posts.details[element]),
        total: state.posts.total,
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

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '15%',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Excerpt',
      dataIndex: 'excerpt',
      key: 'excerpt',
    },
    {
      title: 'Action',
      key: 'operation',
      width: '15%',
      render: (_, record) => {
        return (
          <span>
            <Link
              style={{
                marginRight: 8,
              }}
              to={`/posts/${record.id}/edit`}
            >
              <Button>Edit</Button>
            </Link>
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={() => dispatch(deletePost(record.id)).then(() => fetchPosts())}
            >
              <Button>Delete</Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return (
    <Table
      bordered
      dataSource={posts}
      columns={columns}
      loading={loading}
      rowKey={'id'}
      pagination={{
        total: total,
        current: page,
        pageSize: 5,
        onChange: (page, pageSize) => setPage(page),
      }}
    />
  );
}

export default PostsList;
