import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Spin, Collapse, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import deepEqual from 'deep-equal';
import { addPost, getPosts } from '../../actions/posts';
import { Link, useHistory } from 'react-router-dom';

function Template() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { Meta } = Card;
  const { Panel } = Collapse;
  const [page, setPage] = React.useState(1);
  const [show, setShow] = React.useState(false);
  const { posts, total, loading } = useSelector((state) => {
    const node = state.posts.req.find((item) => {
      let query = {
        page,
        status: 'template',
      };

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
    fetchEntities();
  }, [page]);
  const fetchEntities = () => {
    dispatch(getPosts({ page: page, status: 'template' }));
  };

  const matrix = [];

  for (var i = 0; i < total / 4 + 1; i++) {
    const row = posts.slice(i * 4, (i + 1) * 4).map((post) => (
      <Col span={6}>
        <Card
          bordered={false}
          cover={<img alt="example" src="https://i.stack.imgur.com/2hxGZ.png" />}
          onClick={() => {
            dispatch(addPost({ ...post, status: null })).then((res) =>
              history.push(`/posts/${res.id}/edit`),
            );
          }}
        >
          <Meta description={post.title} />
        </Card>
      </Col>
    ));
    matrix.push(row);
  }
  const genExtra = () => (
    <div onClick={(e) => e.stopPropagation()}>
      <Button
        onClick={() => {
          setShow(!show);
        }}
      >
        {show ? 'show less' : 'show more'}
      </Button>
    </div>
  );

  if (loading) return <Spin style={{ marginLeft: '50%' }} />;

  if (posts.length === 0)
    return (
      <Link to="/posts/create">
        <Button>Create New</Button>
      </Link>
    );

  return (
    <Collapse defaultActiveKey={['1']}>
      <Panel header="Templates" key="1" extra={genExtra()}>
        {!show ? (
          <Row>
            <Col span={3}>
              <Link to="/posts/create">
                <Card
                  bordered={false}
                  cover={
                    <PlusOutlined
                      style={{ fontSize: '150px', marginTop: '50%', color: '#1890ff' }}
                    />
                  }
                >
                  <Meta description={'create new post'} />
                </Card>
              </Link>
            </Col>
            {posts.slice(0, 4).map((post) => (
              <Col span={5}>
                <Link to={`/posts/create/${post.id}`}>
                  <Card
                    bordered={false}
                    cover={<img alt="example" src="https://i.stack.imgur.com/2hxGZ.png" />}
                  >
                    <Meta description={post.title} />
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        ) : (
          matrix.map((each) => <Row>{each.map((e) => e)}</Row>)
        )}
      </Panel>
    </Collapse>
  );
}

export default Template;
