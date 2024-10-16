import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Spin, Collapse, Button, List, Popconfirm } from 'antd';
import deepEqual from 'deep-equal';
import { addPost, deletePost, getPosts } from '../../actions/posts';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PlaceholderImage from '../ErrorsAndImage/PlaceholderImage';
import useNavigation from '../../utils/useNavigation';
import RecordNotFound from '../ErrorsAndImage/RecordNotFound';

function Template({ format }) {
  const dispatch = useDispatch();
  const history = useNavigation();
  const { Meta } = Card;
  const { Panel } = Collapse;
  const page = 1;
  const [show, setShow] = React.useState(false);
  const { posts, loading } = useSelector((state) => {
    const node = state.posts.req.find((item) => {
      let query = {
        page,
        status: 'template',
        format: [format.id],
      };

      return deepEqual(item.query, query);
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
    return { posts: [], loading: state.posts.loading };
  });

  React.useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchTemplates = () => {
    dispatch(getPosts({ page: page, status: 'template', format: [format.id] }));
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

  const handleAddPost = (item) => {
    if (format.slug === 'article') {
      dispatch(
        addPost({ ...item, tag_ids: item.tags, category_ids: item.categories, status: 'draft' }),
      ).then((res) => history(`/posts/${res.id}/edit`));
    } else if (format.slug === 'fact-check') {
      dispatch(
        addPost({
          ...item,
          tag_ids: item.tags,
          category_ids: item.categories,
          claim_ids: item.claims,
          status: 'draft',
        }),
      ).then((res) => history(`/fact-checks/${res.id}/edit`));
    }
  };

  const handleChange = (nextkeys) => {
    console.log(nextkeys);
    if (nextkeys.includes('1')) {
      setShow(true);
      return;
    }
    setShow(false);
  };

  return (
    <Collapse
      defaultActiveKey={[]}
      activeKey={show ? ['1'] : []}
      style={{ marginBottom: '0.75rem' }}
      onChange={handleChange}
    >
      <Panel header="Templates" key="1" extra={genExtra()} isActive={show}>
        {loading ? (
          <Spin style={{ marginLeft: '50%' }} />
        ) : posts.length === 0 ? (
          <RecordNotFound status="info" title="No Templates found" />
        ) : (
          <List
            grid={{ gutter: 16, column: 5 }}
            dataSource={show ? posts : posts.slice(0, 5)}
            renderItem={(item) => (
              <List.Item>
                <Card
                  cover={
                    item.medium ? (
                      <img
                        style={{ cursor: 'pointer' }}
                        alt="example"
                        src={item.medium.url?.[window.REACT_APP_ENABLE_IMGPROXY ? 'proxy' : 'raw']}
                        height="230"
                        onClick={() => handleAddPost(item)}
                      />
                    ) : (
                      <button style={{ border: 'none' }} onClick={() => handleAddPost(item)}>
                        <PlaceholderImage />
                      </button>
                    )
                  }
                  actions={[
                    <Link
                      to={
                        format.slug === 'article'
                          ? `/posts/${item.id}/edit`
                          : `/fact-checks/${item.id}/edit`
                      }
                    >
                      <EditOutlined key="edit" />
                    </Link>,
                    <Popconfirm
                      title="Are you sure you want to delete this?"
                      onConfirm={() =>
                        dispatch(deletePost(item.id))
                          .then(() => {
                            fetchTemplates();
                          })
                          .then(() =>
                            dispatch(getPosts({ page: 1, limit: 5, format: [format.id] })),
                          )
                      }
                    >
                      <DeleteOutlined key="delete" danger />
                    </Popconfirm>,
                  ]}
                >
                  <Meta description={item.title} onClick={() => handleAddPost(item)} />
                </Card>
              </List.Item>
            )}
          />
        )}
      </Panel>
    </Collapse>
  );
}

export default Template;
