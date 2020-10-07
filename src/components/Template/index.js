import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Spin, Collapse, Button, List } from 'antd';
import deepEqual from 'deep-equal';
import { addPost, getPosts } from '../../actions/posts';
import { useHistory } from 'react-router-dom';

function Template() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { Meta } = Card;
  const { Panel } = Collapse;
  const page = 1;
  const [show, setShow] = React.useState(false);
  const { posts, loading } = useSelector((state) => {
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
    return { posts: [], loading: state.posts.loading };
  });

  React.useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  const fetchTemplates = () => {
    dispatch(getPosts({ page: page, status: 'template' }));
  };

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

  if (posts.length === 0) return null;

  return (
    <Collapse defaultActiveKey={['1']}>
      <Panel header="Templates" key="1" extra={genExtra()}>
        <List
          grid={{ gutter: 16, column: 5 }}
          dataSource={show ? posts : posts.slice(0, 5)}
          renderItem={(item) => (
            <List.Item>
              <Card
                bordered={false}
                cover={
                  <img
                    alt="example"
                    src="https://www.wesa.fm/sites/wesa/files/styles/medium/public/201610/Fact-CheckGraphics-Template-08.png"
                    height="230"
                  />
                }
                onClick={() => {
                  dispatch(addPost({ ...item, status: null })).then((res) =>
                    history.push(`/posts/${res.id}/edit`),
                  );
                }}
              >
                <Meta description={item.title} />
              </Card>
            </List.Item>
          )}
        />
      </Panel>
    </Collapse>
  );
}

export default Template;
